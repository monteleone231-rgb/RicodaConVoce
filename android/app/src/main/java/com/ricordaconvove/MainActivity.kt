package com.ricordaconvove

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.ValueCallback
import android.net.Uri
import androidx.core.content.ContextCompat
import androidx.core.content.edit
import androidx.core.net.toUri
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.getcapacitor.BridgeActivity
import org.json.JSONArray
import org.json.JSONObject
import android.speech.tts.TextToSpeech
import java.io.File
import java.io.FileOutputStream
import java.util.Locale

class MainActivity : BridgeActivity(), TextToSpeech.OnInitListener {
    private val TAG_NATIVE = "RicordaConVoceNative"
    private lateinit var scheduler: AlarmScheduler
    private var tts: TextToSpeech? = null
    private var isTtsInitialized = false

    // Flag per tenere attiva la SplashScreen nativa finché la WebView non ha caricato l'interfaccia
    private var isPageReady = false

    @Volatile
    var cachedSoundsJson: String = "[]"

    override fun onCreate(savedInstanceState: Bundle?) {
        // 1. Inizializza la Splash Screen API PRIMA di super.onCreate()
        val splashScreen = installSplashScreen()

        super.onCreate(savedInstanceState)

        // 2. Blocca la Splash Screen finché la pagina web non è completamente pronta
        splashScreen.setKeepOnScreenCondition {
            !isPageReady
        }

        scheduler = AlarmScheduler(this)
        
        try {
            tts = TextToSpeech(this, this)
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error creating TextToSpeech", e)
        }

        // Preload device ringtones and notification sounds in a background thread to prevent UI freezing
        Thread {
            val ringtonesList = JSONArray()
            try {
                val rm = RingtoneManager(this)
                rm.setType(RingtoneManager.TYPE_NOTIFICATION or RingtoneManager.TYPE_RINGTONE)
                val cursor = rm.cursor
                while (cursor.moveToNext()) {
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                    val uri = rm.getRingtoneUri(cursor.position)
                    if (uri != null) {
                        val obj = JSONObject()
                        obj.put("title", title)
                        obj.put("uri", uri.toString())
                        ringtonesList.put(obj)
                    }
                }
                cachedSoundsJson = ringtonesList.toString()
                Log.d(TAG_NATIVE, "Preloaded ${ringtonesList.length()} device sounds in background.")
            } catch (e: Exception) {
                Log.e(TAG_NATIVE, "Error preloading device sounds in background", e)
            }
        }.start()

        bridge?.webView?.let { webView ->
            // Imposta lo sfondo della WebView su azzurro per eliminare qualsiasi flash bianco transitorio
            webView.setBackgroundColor(android.graphics.Color.parseColor("#00B4D8"))

            webView.settings.javaScriptEnabled = true
            webView.settings.mediaPlaybackRequiresUserGesture = false
            webView.settings.domStorageEnabled = true
            webView.settings.allowFileAccess = true

            webView.addJavascriptInterface(AndroidInterface(this, this, scheduler), "Android")
            Log.d(TAG_NATIVE, "Custom JavaScript Interface 'Android' successfully registered.")

            // Intercetta onPageFinished per sbloccare la Splash Screen non appena la Web UI è renderizzata
            val originalWebViewClient = webView.webViewClient
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    originalWebViewClient?.onPageFinished(view, url)
                    isPageReady = true
                    Log.d(TAG_NATIVE, "WebView page finished loading. Dismissing native SplashScreen.")
                }
            }

            // Set custom WebChromeClient wrapper to safely grant web microphone permissions while delegating to Capacitor's original chrome client
            val originalChromeClient = webView.webChromeClient
            webView.webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    if (request != null) {
                        runOnUiThread {
                            try {
                                request.grant(request.resources)
                                Log.d(TAG_NATIVE, "Granted webview microphone/media permissions.")
                            } catch (e: Exception) {
                                Log.e(TAG_NATIVE, "Error granting webview permission", e)
                            }
                        }
                        return
                    }
                    if (originalChromeClient != null) {
                        originalChromeClient.onPermissionRequest(request)
                    } else {
                        super.onPermissionRequest(request)
                    }
                }

                override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                    return originalChromeClient?.onConsoleMessage(consoleMessage) ?: super.onConsoleMessage(consoleMessage)
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    return originalChromeClient?.onShowFileChooser(webView, filePathCallback, fileChooserParams) ?: super.onShowFileChooser(webView, filePathCallback, fileChooserParams)
                }
            }
        }

        // Timeout di sicurezza per sbloccare la splash screen in ogni circostanza dopo max 3 secondi
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            if (!isPageReady) {
                isPageReady = true
                Log.d(TAG_NATIVE, "Safety timeout reached: force dismissing SplashScreen.")
            }
        }, 3000)

        // Request runtime microphone permission on startup if not already granted (Android M/6.0+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(arrayOf(android.Manifest.permission.RECORD_AUDIO), 101)
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            isTtsInitialized = true
            Log.d(TAG_NATIVE, "TextToSpeech successfully initialized.")
            // Set default language to Italian
            tts?.language = Locale.ITALIAN
        } else {
            Log.e(TAG_NATIVE, "Failed to initialize TextToSpeech (status: $status)")
        }
    }

    fun speak(text: String, lang: String, rate: Float, tone: String) {
        if (!isTtsInitialized || tts == null) {
            Log.e(TAG_NATIVE, "speak: TTS not initialized or is null")
            return
        }
        try {
            val locale = when {
                lang.lowercase().startsWith("it") -> Locale.ITALIAN
                lang.lowercase().startsWith("es") -> Locale.forLanguageTag("es-ES")
                lang.lowercase().startsWith("fr") -> Locale.FRENCH
                lang.lowercase().startsWith("de") -> Locale.GERMAN
                else -> Locale.ENGLISH
            }
            tts?.language = locale
            tts?.setSpeechRate(rate)
            
            // Warm pitch vs clear firm pitch
            val pitch = if (tone == "empathetic") 1.2f else 1.0f
            tts?.setPitch(pitch)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ricordaconvoce_speech")
            } else {
                @Suppress("DEPRECATION")
                tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null)
            }
            Log.d(TAG_NATIVE, "Native TTS speaking: $text")
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error during speak", e)
        }
    }

    fun stopSpeaking() {
        try {
            tts?.stop()
            Log.d(TAG_NATIVE, "Stopped native speaking")
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error stopping native TTS", e)
        }
    }

    override fun onDestroy() {
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (e: Exception) {
            Log.e(TAG_NATIVE, "Error on destroying TextToSpeech", e)
        }
        super.onDestroy()
    }

    class AndroidInterface(
        private val activity: android.app.Activity,
        private val context: Context,
        private val scheduler: AlarmScheduler
    ) {
        private var currentRingtone: Ringtone? = null
        private var customVoicePlayer: MediaPlayer? = null

        private fun saveVoiceDataToFile(id: Int, dataUrlOrBase64: String): String? {
            if (dataUrlOrBase64.isBlank()) return null
            try {
                // If it's already an existing file path
                if (dataUrlOrBase64.startsWith("/") || dataUrlOrBase64.startsWith("file://")) {
                    val filePath = dataUrlOrBase64.removePrefix("file://")
                    val existingFile = File(filePath)
                    if (existingFile.exists() && existingFile.length() > 0) {
                        return existingFile.absolutePath
                    }
                }

                // Decode base64 (strip data URI prefix if present)
                val base64Data = if (dataUrlOrBase64.contains(",")) {
                    dataUrlOrBase64.substringAfter(",")
                } else {
                    dataUrlOrBase64
                }

                val audioBytes = Base64.decode(base64Data, Base64.DEFAULT)
                if (audioBytes.isNotEmpty()) {
                    val targetFile = File(context.filesDir, "custom_voice_${id}.m4a")
                    FileOutputStream(targetFile).use { fos ->
                        fos.write(audioBytes)
                        fos.flush()
                    }
                    Log.d("RicordaConVoceNative", "Saved custom voice file for ID $id (${audioBytes.size} bytes) at ${targetFile.absolutePath}")
                    return targetFile.absolutePath
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error saving custom voice data to file for ID $id", e)
            }
            return null
        }

        @JavascriptInterface
        fun playCustomVoice(audioDataOrUri: String) {
            try {
                stopCustomVoice()
                if (audioDataOrUri.isBlank()) return

                var audioFilePath: String? = null
                if (audioDataOrUri.startsWith("/") || audioDataOrUri.startsWith("file://")) {
                    val path = audioDataOrUri.removePrefix("file://")
                    if (File(path).exists()) {
                        audioFilePath = path
                    }
                }

                if (audioFilePath == null) {
                    // Save to temp preview file
                    val base64Data = if (audioDataOrUri.contains(",")) {
                        audioDataOrUri.substringAfter(",")
                    } else {
                        audioDataOrUri
                    }
                    val bytes = Base64.decode(base64Data, Base64.DEFAULT)
                    if (bytes.isNotEmpty()) {
                        val tempFile = File(context.cacheDir, "preview_custom_voice.m4a")
                        FileOutputStream(tempFile).use { it.write(bytes) }
                        audioFilePath = tempFile.absolutePath
                    }
                }

                if (audioFilePath != null) {
                    val player = MediaPlayer()
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        player.setAudioAttributes(
                            AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_MEDIA)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                .build()
                        )
                    }
                    player.setDataSource(audioFilePath)
                    player.setVolume(1.0f, 1.0f)
                    player.setOnPreparedListener { mp ->
                        mp.start()
                        Log.d("RicordaConVoceNative", "Playing custom voice natively.")
                    }
                    player.setOnCompletionListener { mp ->
                        mp.release()
                        if (customVoicePlayer == mp) {
                            customVoicePlayer = null
                        }
                    }
                    player.setOnErrorListener { mp, _, _ ->
                        mp.release()
                        if (customVoicePlayer == mp) {
                            customVoicePlayer = null
                        }
                        true
                    }
                    player.prepareAsync()
                    customVoicePlayer = player
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error in playCustomVoice", e)
            }
        }

        @JavascriptInterface
        fun stopCustomVoice() {
            try {
                customVoicePlayer?.let {
                    if (it.isPlaying) it.stop()
                    it.release()
                }
                customVoicePlayer = null
                Log.d("RicordaConVoceNative", "Stopped custom voice playback.")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error stopping custom voice player", e)
            }
        }

        @JavascriptInterface
        fun vibrate(durationMillis: Double) {
            vibrate(durationMillis.toLong())
        }

        @JavascriptInterface
        fun vibrate(durationMillis: Long) {
            try {
                val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? android.os.VibratorManager
                    vibratorManager?.defaultVibrator
                } else {
                    @Suppress("DEPRECATION")
                    context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                }
                if (vibrator == null || !vibrator.hasVibrator()) {
                    Log.w("RicordaConVoceNative", "vibrate: Device does not have a vibrator motor")
                    return
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(durationMillis, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(durationMillis)
                }
                Log.d("RicordaConVoceNative", "Vibrated native device for $durationMillis ms")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error in native vibration", e)
            }
        }

        @JavascriptInterface
        fun getDeviceSounds(): String {
            val cached = (activity as? MainActivity)?.cachedSoundsJson
            if (cached != null && cached != "[]") {
                Log.d("RicordaConVoceNative", "Returning cached device sounds instantly.")
                return cached
            }
            // Fallback (should rarely occur, but is safe in case cache isn't fully loaded yet)
            val ringtonesList = JSONArray()
            try {
                val rm = RingtoneManager(context)
                rm.setType(RingtoneManager.TYPE_NOTIFICATION or RingtoneManager.TYPE_RINGTONE)
                val cursor = rm.cursor
                while (cursor.moveToNext()) {
                    val title = cursor.getString(RingtoneManager.TITLE_COLUMN_INDEX)
                    val uri = rm.getRingtoneUri(cursor.position)
                    if (uri != null) {
                        val obj = JSONObject()
                        obj.put("title", title)
                        obj.put("uri", uri.toString())
                        ringtonesList.put(obj)
                    }
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error querying device sounds in fallback", e)
            }
            return ringtonesList.toString()
        }

        @JavascriptInterface
        fun playDeviceSound(uriString: String) {
            try {
                stopDeviceSound()
                val uri = uriString.toUri()
                currentRingtone = RingtoneManager.getRingtone(context, uri)
                currentRingtone?.play()
                Log.d("RicordaConVoceNative", "Playing device sound: $uriString")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error playing device sound", e)
            }
        }

        @JavascriptInterface
        fun stopDeviceSound() {
            try {
                currentRingtone?.let {
                    if (it.isPlaying) {
                        it.stop()
                    }
                }
                currentRingtone = null
                Log.d("RicordaConVoceNative", "Stopped device sound playback")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error stopping device sound", e)
            }
        }

        @JavascriptInterface
        fun scheduleAlarm(
            timeMillis: Long,
            id: Int,
            name: String,
            voicePrompt: String = "",
            dosage: String = "",
            timeSlot: String = "",
            customVoiceUri: String = ""
        ) {
            val customVoicePath = if (customVoiceUri.isNotBlank()) {
                saveVoiceDataToFile(id, customVoiceUri) ?: ""
            } else {
                ""
            }
            scheduler.scheduleExactAlarm(timeMillis, id, name, voicePrompt, dosage, timeSlot, customVoicePath)
            Log.d("RicordaConVoceNative", "Scheduled alarm: $name (ID: $id) at $timeMillis, customVoicePath: '$customVoicePath'")
        }

        @JavascriptInterface
        fun getTakenSlotsFromNative(): String {
            val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
            return prefs.getString("taken_slots_json", "[]") ?: "[]"
        }

        @JavascriptInterface
        fun markSlotTakenInNative(medName: String, timeSlot: String, dateStr: String) {
            try {
                val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
                val currentJsonStr = prefs.getString("taken_slots_json", "[]") ?: "[]"
                val array = JSONArray(currentJsonStr)
                val key = "${medName}_${timeSlot}_$dateStr"
                var exists = false
                for (i in 0 until array.length()) {
                    if (array.getString(i) == key) { exists = true; break }
                }
                if (!exists) {
                    array.put(key)
                    prefs.edit { putString("taken_slots_json", array.toString()) }
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error marking slot taken in native", e)
            }
        }

        @JavascriptInterface
        fun cancelAlarm(id: Int) {
            scheduler.cancelAlarm(id)
            try {
                val voiceFile = File(context.filesDir, "custom_voice_${id}.m4a")
                if (voiceFile.exists()) {
                    voiceFile.delete()
                }
            } catch (e: Exception) {
                Log.w("RicordaConVoceNative", "Error deleting custom voice file for cancelled alarm ID $id", e)
            }
            Log.d("RicordaConVoceNative", "Cancelled alarm ID: $id")
        }

        @JavascriptInterface
        fun saveAlarmsToNative(alarmsJson: String) {
            try {
                val array = JSONArray(alarmsJson)
                val processedArray = JSONArray()

                for (i in 0 until array.length()) {
                    val obj = array.optJSONObject(i) ?: continue
                    val id = obj.optInt("nativeId", -1)
                    val customVoiceUri = obj.optString("customVoiceUri", "")

                    if (id != -1 && customVoiceUri.isNotBlank()) {
                        val filePath = saveVoiceDataToFile(id, customVoiceUri)
                        if (filePath != null) {
                            obj.put("customVoicePath", filePath)
                        }
                    }
                    processedArray.put(obj)
                }

                val finalJson = processedArray.toString()
                val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
                prefs.edit {
                    putString("active_alarms", finalJson)
                }
                Log.d("RicordaConVoceNative", "Saved alarms with custom voice paths to native storage (${processedArray.length()} items).")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error parsing and saving active alarms", e)
                val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
                prefs.edit {
                    putString("active_alarms", alarmsJson)
                }
            }
        }

        @JavascriptInterface
        fun savePreferencesToNative(lang: String, voiceEnabled: Boolean, speed: Double, tone: String) {
            val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
            prefs.edit {
                putString("lang", lang)
                putBoolean("voiceEnabled", voiceEnabled)
                putFloat("speed", speed.toFloat())
                putString("tone", tone)
            }
            Log.d("RicordaConVoceNative", "Saved preferences to native storage: lang=$lang, voiceEnabled=$voiceEnabled, speed=$speed, tone=$tone")
        }

        private var nativeMediaRecorder: MediaRecorder? = null
        private var audioRecordFile: File? = null

        @JavascriptInterface
        fun startNativeVoiceRecording(): Boolean {
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (ContextCompat.checkSelfPermission(activity, android.Manifest.permission.RECORD_AUDIO) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                        activity.runOnUiThread {
                            activity.requestPermissions(arrayOf(android.Manifest.permission.RECORD_AUDIO), 101)
                        }
                        return false
                    }
                }
                cancelNativeVoiceRecording()
                val outputFile = File(context.cacheDir, "ricordaconvoce_voice_temp.m4a")
                if (outputFile.exists()) {
                    outputFile.delete()
                }
                audioRecordFile = outputFile

                val recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    MediaRecorder(context)
                } else {
                    @Suppress("DEPRECATION")
                    MediaRecorder()
                }

                recorder.setAudioSource(MediaRecorder.AudioSource.MIC)
                recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                recorder.setAudioEncodingBitRate(96000)
                recorder.setAudioSamplingRate(44100)
                recorder.setOutputFile(outputFile.absolutePath)
                recorder.prepare()
                recorder.start()
                nativeMediaRecorder = recorder
                Log.d("RicordaConVoceNative", "Native MediaRecorder started successfully.")
                true
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Failed to start native audio recording", e)
                nativeMediaRecorder = null
                false
            }
        }

        @JavascriptInterface
        fun stopNativeVoiceRecording(): String {
            return try {
                nativeMediaRecorder?.let {
                    try {
                        it.stop()
                    } catch (e: Exception) {
                        Log.w("RicordaConVoceNative", "stop error on MediaRecorder", e)
                    }
                    it.release()
                }
                nativeMediaRecorder = null

                val file = audioRecordFile
                if (file != null && file.exists() && file.length() > 0) {
                    val bytes = file.readBytes()
                    val base64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                    Log.d("RicordaConVoceNative", "Native voice recorded: ${bytes.size} bytes")
                    "data:audio/mp4;base64,$base64"
                } else {
                    ""
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error stopping native voice recording", e)
                nativeMediaRecorder = null
                ""
            }
        }

        @JavascriptInterface
        fun cancelNativeVoiceRecording() {
            try {
                nativeMediaRecorder?.let {
                    try {
                        it.stop()
                    } catch (_: Exception) {}
                    it.release()
                }
            } catch (e: Exception) {
                Log.w("RicordaConVoceNative", "Error cancelling native recording", e)
            } finally {
                nativeMediaRecorder = null
            }
        }

        @JavascriptInterface
        fun hasRecordAudioPermission(): Boolean {
            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                ContextCompat.checkSelfPermission(activity, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
        }

        @JavascriptInterface
        fun requestRecordAudioPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                activity.runOnUiThread {
                    activity.requestPermissions(arrayOf(android.Manifest.permission.RECORD_AUDIO), 101)
                }
            }
        }

        @JavascriptInterface
        fun openAppSettings() {
            try {
                val intent = android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
                intent.data = android.net.Uri.parse("package:" + context.packageName)
                intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
                Log.d("RicordaConVoceNative", "Opened app settings.")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error opening app settings", e)
            }
        }

        @JavascriptInterface
        fun openNotificationSettings() {
            try {
                val intent = android.content.Intent()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    intent.action = android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS
                    intent.putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, context.packageName)
                } else {
                    intent.action = "android.settings.APP_NOTIFICATION_SETTINGS"
                    intent.putExtra("app_package", context.packageName)
                    intent.putExtra("app_uid", context.applicationInfo.uid)
                }
                intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
                Log.d("RicordaConVoceNative", "Opened notification settings.")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error opening notification settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openExactAlarmSettings() {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val intent = android.content.Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                    intent.data = android.net.Uri.parse("package:" + context.packageName)
                    intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                    Log.d("RicordaConVoceNative", "Opened exact alarm settings.")
                } else {
                    openAppSettings()
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error opening exact alarm settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openBatteryOptimizationSettings() {
            try {
                val intent = android.content.Intent()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    intent.action = android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                } else {
                    intent.action = android.provider.Settings.ACTION_SETTINGS
                }
                intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
                Log.d("RicordaConVoceNative", "Opened battery optimization settings.")
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error opening battery settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openOverlaySettings() {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    val intent = android.content.Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
                    intent.data = android.net.Uri.parse("package:" + context.packageName)
                    intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                    Log.d("RicordaConVoceNative", "Opened overlay settings.")
                } else {
                    openAppSettings()
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error opening overlay settings", e)
                openAppSettings()
            }
        }

        @JavascriptInterface
        fun openFullScreenIntentSettings() {
            try {
                if (Build.VERSION.SDK_INT >= 34) { // Build.VERSION_CODES.UPSIDE_DOWN_CAKE
                    val intent = android.content.Intent("android.settings.MANAGE_APP_USE_FULL_SCREEN_INTENT")
                    intent.data = android.net.Uri.parse("package:" + context.packageName)
                    intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                    context.startActivity(intent)
                    Log.d("RicordaConVoceNative", "Opened full screen intent settings (Android 14+).")
                } else {
                    openNotificationSettings()
                }
            } catch (e: Exception) {
                Log.e("RicordaConVoceNative", "Error opening full screen intent settings", e)
                openNotificationSettings()
            }
        }

        @JavascriptInterface
        fun speak(text: String, lang: String, rate: Double, tone: String) {
            activity.runOnUiThread {
                (activity as? MainActivity)?.speak(text, lang, rate.toFloat(), tone)
            }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            activity.runOnUiThread {
                (activity as? MainActivity)?.stopSpeaking()
            }
        }
    }
}
