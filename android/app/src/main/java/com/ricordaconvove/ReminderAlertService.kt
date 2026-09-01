package com.ricordaconvove

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.File
import java.util.Locale

class ReminderAlertService : Service(), TextToSpeech.OnInitListener {
    private var ringtone: Ringtone? = null
    private var mediaPlayer: MediaPlayer? = null
    private var tts: TextToSpeech? = null
    private var reminderName: String = "Promemoria"
    private var voicePrompt: String = ""
    private var dosage: String = ""
    private var timeSlot: String = ""
    private var customVoicePath: String = ""
    private var hasCustomVoice: Boolean = false
    private val loopHandler = Handler(Looper.getMainLooper())
    private var isServiceActive = true

    companion object {
        private const val TAG = "ReminderAlertService"
        private const val NOTIFICATION_ID = 99999
        private const val CHANNEL_ID = "ricordaconvoce_alert_service_channel"
    }

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")
        isServiceActive = true
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        reminderName = intent?.getStringExtra("MED_NAME") ?: "Promemoria"
        voicePrompt = intent?.getStringExtra("VOICE_PROMPT") ?: ""
        dosage = intent?.getStringExtra("DOSAGE") ?: ""
        timeSlot = intent?.getStringExtra("TIME_SLOT") ?: ""
        customVoicePath = intent?.getStringExtra("CUSTOM_VOICE_PATH") ?: ""
        val alarmId = intent?.getIntExtra("ALARM_ID", -1) ?: -1

        // 1. Check if a personal recorded voice file exists on disk
        if (customVoicePath.isNotBlank()) {
            val file = File(customVoicePath)
            if (file.exists() && file.length() > 0) {
                hasCustomVoice = true
            }
        }

        if (!hasCustomVoice && alarmId != -1) {
            val fileById = File(filesDir, "custom_voice_${alarmId}.m4a")
            if (fileById.exists() && fileById.length() > 0) {
                customVoicePath = fileById.absolutePath
                hasCustomVoice = true
            }
        }

        // 2. Check SharedPreferences fallback
        if (!hasCustomVoice || voicePrompt.isBlank()) {
            try {
                val prefs = getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
                val alarmsJson = prefs.getString("active_alarms", null)
                if (!alarmsJson.isNullOrEmpty()) {
                    val array = org.json.JSONArray(alarmsJson)
                    for (i in 0 until array.length()) {
                        val obj = array.optJSONObject(i) ?: continue
                        if (obj.optString("name") == reminderName && obj.optString("time") == timeSlot) {
                            if (voicePrompt.isBlank()) {
                                voicePrompt = obj.optString("voicePrompt", "")
                            }
                            if (dosage.isBlank()) {
                                dosage = obj.optString("dosage", "")
                            }
                            val savedVoicePath = obj.optString("customVoicePath", "")
                            if (!hasCustomVoice && savedVoicePath.isNotBlank()) {
                                val savedFile = File(savedVoicePath)
                                if (savedFile.exists() && savedFile.length() > 0) {
                                    customVoicePath = savedVoicePath
                                    hasCustomVoice = true
                                }
                            }
                            break
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error looking up reminder details from active_alarms", e)
            }
        }

        Log.d(TAG, "Service started for $reminderName - hasCustomVoice: $hasCustomVoice, path: '$customVoicePath', voicePrompt: '$voicePrompt'")

        // 3. Foreground Notification setup
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Servizio Allarmi Ricorda con Voce",
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }

        val notificationTitle = if (hasCustomVoice) "🎙️ Promemoria con Voce Personale" else "🔊 Allarme Ricorda con Voce attivo"
        val notificationContent = "Promemoria per: $reminderName"

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(notificationTitle)
            .setContentText(notificationContent)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)

        // 4. Play audio: Personal Recorded Voice vs Synthetic Voice + Ringtone
        if (hasCustomVoice) {
            // PLAY PERSONAL RECORDED VOICE VIA MEDIAPLAYER
            playPersonalVoiceRecording(customVoicePath)
        } else {
            // Play alarm ringtone + initialize TextToSpeech for synthetic voice
            playDefaultRingtone()
            initTts()
        }

        return START_STICKY
    }

    private fun playPersonalVoiceRecording(filePath: String) {
        try {
            stopAudioPlayback()

            val player = MediaPlayer()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                player.setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                        .build()
                )
            }
            player.setDataSource(filePath)
            player.setVolume(1.0f, 1.0f)
            player.setOnPreparedListener { mp ->
                if (isServiceActive) {
                    mp.start()
                    Log.d(TAG, "Playing personal recorded voice: $filePath")
                }
            }
            player.setOnCompletionListener {
                // Repeat playback after 3 seconds while reminder is active
                if (isServiceActive) {
                    loopHandler.postDelayed({
                        if (isServiceActive) {
                            try {
                                player.seekTo(0)
                                player.start()
                                Log.d(TAG, "Replaying personal recorded voice")
                            } catch (e: Exception) {
                                Log.e(TAG, "Error replaying voice recording", e)
                            }
                        }
                    }, 3000L)
                }
            }
            player.setOnErrorListener { _, what, extra ->
                Log.e(TAG, "MediaPlayer error playing personal voice ($what, $extra), falling back to TTS")
                playDefaultRingtone()
                initTts()
                true
            }
            player.prepareAsync()
            mediaPlayer = player
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start personal voice recording playback", e)
            playDefaultRingtone()
            initTts()
        }
    }

    private fun playDefaultRingtone() {
        try {
            val alarmUri: Uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            ringtone = RingtoneManager.getRingtone(this, alarmUri).apply {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    audioAttributes = AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                }
                play()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error playing ringtone", e)
        }
    }

    private fun initTts() {
        try {
            tts = TextToSpeech(applicationContext, this, "com.google.android.tts")
        } catch (e: Exception) {
            try {
                tts = TextToSpeech(applicationContext, this)
            } catch (e2: Exception) {
                Log.e(TAG, "Error creating TextToSpeech", e2)
            }
        }
    }

    override fun onInit(status: Int) {
        // If we are playing a personal recorded voice, do not speak with TTS
        if (hasCustomVoice) {
            Log.d(TAG, "TTS initialized but skipping speech because personal recorded voice is active.")
            return
        }

        if (status == TextToSpeech.SUCCESS) {
            val prefs = getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
            val lang = prefs.getString("lang", "it") ?: "it"
            val voiceEnabled = prefs.getBoolean("voiceEnabled", true)
            val speed = prefs.getFloat("speed", 0.75f)
            val tone = prefs.getString("tone", "empathetic") ?: "empathetic"

            if (voiceEnabled) {
                try {
                    val locale = when {
                        lang.lowercase().startsWith("it") -> Locale.ITALY
                        lang.lowercase().startsWith("es") -> Locale.forLanguageTag("es-ES")
                        lang.lowercase().startsWith("fr") -> Locale.FRANCE
                        lang.lowercase().startsWith("de") -> Locale.GERMANY
                        else -> Locale.US
                    }
                    tts?.language = locale
                    tts?.setSpeechRate(speed)
                    tts?.setPitch(if (tone == "empathetic") 1.2f else 1.0f)

                    val textToSpeak = if (voicePrompt.isNotBlank()) {
                        voicePrompt
                    } else {
                        when {
                            lang.lowercase().startsWith("it") -> "Attenzione, è l'ora del promemoria: $reminderName"
                            lang.lowercase().startsWith("es") -> "Atención, es hora del recordatorio: $reminderName"
                            lang.lowercase().startsWith("fr") -> "Attention, c'est l'heure du rappel : $reminderName"
                            lang.lowercase().startsWith("de") -> "Achtung, es ist Zeit für die Erinnerung: $reminderName"
                            else -> "Attention, it is time for your reminder: $reminderName"
                        }
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        val params = Bundle().apply {
                            putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
                        }
                        tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, params, "ricordaconvoce_alert_speech")
                    } else {
                        @Suppress("DEPRECATION")
                        tts?.speak(textToSpeak, TextToSpeech.QUEUE_FLUSH, null)
                    }
                    Log.d(TAG, "Native alert speaking: $textToSpeak")
                } catch (e: Exception) {
                    Log.e(TAG, "Error speaking natively in service", e)
                }
            }
        } else {
            Log.e(TAG, "Failed to initialize TextToSpeech in Service")
        }
    }

    private fun stopAudioPlayback() {
        loopHandler.removeCallbacksAndMessages(null)
        try {
            mediaPlayer?.let {
                if (it.isPlaying) it.stop()
                it.release()
            }
            mediaPlayer = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping MediaPlayer", e)
        }
        try {
            ringtone?.stop()
            ringtone = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping ringtone", e)
        }
        try {
            tts?.stop()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping TTS", e)
        }
    }

    override fun onDestroy() {
        isServiceActive = false
        Log.d(TAG, "Service destroyed")
        stopAudioPlayback()
        try {
            tts?.shutdown()
            tts = null
        } catch (e: Exception) {
            Log.e(TAG, "Error shutting down TextToSpeech in Service", e)
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
