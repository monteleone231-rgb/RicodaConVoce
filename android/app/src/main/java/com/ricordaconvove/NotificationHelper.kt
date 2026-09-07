package com.ricordaconvove

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object NotificationHelper {

    private const val TAG = "NotificationHelper"
    private const val CHANNEL_ID = "ricordaconvoce_critical_reminders"
    private const val CHANNEL_NAME = "Promemoria Vocali Ricorda con Voce"

    private const val CALL_QUIET_CHANNEL_ID = "ricordaconvoce_call_reminders"
    private const val CALL_QUIET_CHANNEL_NAME = "Promemoria durante chiamate"

    /**
     * Rileva se l'utente è attualmente impegnato in una chiamata telefonica (GSM/cellulare),
     * in una chiamata VoIP (WhatsApp, Telegram, Meet, ecc.) o se il telefono sta squillando.
     */
    fun isInPhoneCallOrRinging(context: Context): Boolean {
        return try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return false
            val mode = audioManager.mode
            mode == AudioManager.MODE_IN_CALL ||
            mode == AudioManager.MODE_IN_COMMUNICATION ||
            mode == AudioManager.MODE_RINGTONE
        } catch (e: Exception) {
            Log.e(TAG, "Errore nel controllo dello stato della chiamata", e)
            false
        }
    }

    /**
     * Recupera le stringhe tradotte per le azioni della notifica.
     */
    private fun getLocalizedStrings(context: Context, medName: String, dosage: String): NotificationStrings {
        val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
        val lang = prefs.getString("lang", "it") ?: "it"
        return when {
            lang.startsWith("es") -> NotificationStrings(
                title = "⏰ Recordatorio: $medName",
                body = if (dosage.isNotBlank()) "$medName ($dosage)" else "Recordatorio: $medName",
                btnDismiss = "Silenciar",
                btnTaken = "Hecho",
                btnSnooze = "Posponer (10m)"
            )
            lang.startsWith("fr") -> NotificationStrings(
                title = "⏰ Rappel: $medName",
                body = if (dosage.isNotBlank()) "$medName ($dosage)" else "Rappel: $medName",
                btnDismiss = "Arrêter",
                btnTaken = "Fait",
                btnSnooze = "Reporter (10m)"
            )
            lang.startsWith("de") -> NotificationStrings(
                title = "⏰ Erinnerung: $medName",
                body = if (dosage.isNotBlank()) "$medName ($dosage)" else "Erinnerung: $medName",
                btnDismiss = "Stoppen",
                btnTaken = "Erledigt",
                btnSnooze = "Schlummern (10m)"
            )
            lang.startsWith("en") -> NotificationStrings(
                title = "⏰ Reminder: $medName",
                body = if (dosage.isNotBlank()) "$medName ($dosage)" else "Reminder: $medName",
                btnDismiss = "Dismiss",
                btnTaken = "Done",
                btnSnooze = "Snooze (10m)"
            )
            else -> NotificationStrings(
                title = "⏰ Promemoria: $medName",
                body = if (dosage.isNotBlank()) "$medName ($dosage)" else "Promemoria: $medName",
                btnDismiss = "Zittisci",
                btnTaken = "Fatto",
                btnSnooze = "Posticipa (10m)"
            )
        }
    }

    /**
     * Mostra la notifica standard ad alta priorità nella barra di stato in alto con:
     * - Pulsante immediato "Zittisci" (ferma audio e notifica senza aprire l'app)
     * - Pulsante immediato "Fatto" (segna come preso e zittisce)
     * - Intento a schermo intero (se l'utente desidera aprire l'app toccando la notifica)
     */
    fun showNotification(
        context: Context,
        id: Int,
        medName: String,
        voicePrompt: String = "",
        dosage: String = "",
        timeSlot: String = "",
        customVoicePath: String = ""
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifiche ed allarmi vocali per promemoria quotidiani"
                enableLights(true)
                enableVibration(true)
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Tocco sul corpo della notifica: apre l'app principale
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("OPEN_FROM_NOTIFICATION", true)
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
            putExtra("TIME_SLOT", timeSlot)
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context,
            id,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Intento FullScreenAlert (per accensione display se abilitato)
        val fullScreenIntent = Intent(context, FullScreenAlertActivity::class.java).apply {
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
            putExtra("VOICE_PROMPT", voicePrompt)
            putExtra("DOSAGE", dosage)
            putExtra("TIME_SLOT", timeSlot)
            putExtra("CUSTOM_VOICE_PATH", customVoicePath)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            id + 10000,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val strings = getLocalizedStrings(context, medName, dosage)

        // Azione 1: "Zittisci / Ferma notifica" (arresta audio e rimuove notifica senza aprire l'app)
        val dismissIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_DISMISS
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            context,
            id * 10 + 3,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Azione 2: "Fatto / Ho preso"
        val takenIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_MARK_TAKEN
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
            putExtra("TIME_SLOT", timeSlot)
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            context,
            id * 10 + 1,
            takenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val hasCustomVoice = customVoicePath.isNotBlank()
        val notifTitle = if (hasCustomVoice) "🎙️ ${strings.title}" else strings.title

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(notifTitle)
            .setContentText(strings.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(strings.body))
            .setContentIntent(openAppPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setAutoCancel(true)
            .setOngoing(false)
            .setBadgeIconType(NotificationCompat.BADGE_ICON_SMALL)
            .setNumber(1)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, strings.btnDismiss, dismissPendingIntent)
            .addAction(android.R.drawable.checkbox_on_background, strings.btnTaken, takenPendingIntent)

        notificationManager.notify(id, builder.build())
    }

    /**
     * Mostra una notifica discreta nella barra di stato in alto quando l'utente è al telefono:
     * - Nessun suono invasivo o voce sull'altoparlante durante la telefonata.
     * - Mostra il badge / punto rosso sull'icona dell'applicazione.
     * - Fornisce azioni rapide: "Fatto", "Zittisci", "Posticipa".
     */
    fun showCallQuietNotification(
        context: Context,
        id: Int,
        medName: String,
        voicePrompt: String = "",
        dosage: String = "",
        timeSlot: String = "",
        customVoicePath: String = "",
        snoozeMinutes: Int = 10
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CALL_QUIET_CHANNEL_ID,
                CALL_QUIET_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifiche discrete e punto rosso durante una chiamata in corso"
                setSound(null, null)
                enableLights(true)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 150)
                setShowBadge(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }

        val strings = getLocalizedStrings(context, medName, dosage)
        val bodyWithSnooze = "${strings.body} • Auto-snooze ${snoozeMinutes}m"

        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context,
            id,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Azione: "Zittisci"
        val dismissIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_DISMISS
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
        }
        val dismissPendingIntent = PendingIntent.getBroadcast(
            context,
            id * 10 + 3,
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Azione: "Fatto"
        val takenIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_MARK_TAKEN
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
            putExtra("TIME_SLOT", timeSlot)
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            context,
            id * 10 + 1,
            takenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, CALL_QUIET_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("📞 ${strings.title}")
            .setContentText(bodyWithSnooze)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bodyWithSnooze))
            .setContentIntent(openAppPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setNumber(1)
            .setBadgeIconType(NotificationCompat.BADGE_ICON_SMALL)
            .setAutoCancel(true)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, strings.btnDismiss, dismissPendingIntent)
            .addAction(android.R.drawable.checkbox_on_background, strings.btnTaken, takenPendingIntent)

        notificationManager.notify(id, builder.build())
        Log.d(TAG, "Mostrata notifica discreta per promemoria '$medName'")
    }

    /**
     * Registra l'assunzione di una dose nelle SharedPreferences native,
     * sincronizzandola con l'interfaccia React e lo storico dell'app.
     */
    fun markSlotTaken(context: Context, medName: String, timeSlot: String) {
        try {
            val todayDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
            val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
            val currentJsonStr = prefs.getString("taken_slots_json", "[]") ?: "[]"
            val array = JSONArray(currentJsonStr)
            val key = "${medName}_${timeSlot}_$todayDate"

            var exists = false
            for (i in 0 until array.length()) {
                if (array.getString(i) == key) {
                    exists = true
                    break
                }
            }
            if (!exists) {
                array.put(key)
                prefs.edit().putString("taken_slots_json", array.toString()).apply()
                Log.d(TAG, "Registrata assunzione nello storico: $key")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Errore nel salvataggio dell'assunzione nello storage nativo", e)
        }
    }

    /**
     * Rimuove l'assunzione da SharedPreferences se l'utente toglie la spunta da "Fatto".
     */
    fun unmarkSlotTaken(context: Context, medName: String, timeSlot: String, dateStr: String) {
        try {
            val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
            val currentJsonStr = prefs.getString("taken_slots_json", "[]") ?: "[]"
            val array = JSONArray(currentJsonStr)
            val newArray = JSONArray()
            val targetKey = "${medName}_${timeSlot}_$dateStr"

            for (i in 0 until array.length()) {
                val item = array.getString(i)
                if (item != targetKey) {
                    newArray.put(item)
                }
            }
            prefs.edit().putString("taken_slots_json", newArray.toString()).apply()
            Log.d(TAG, "Rimossa assunzione dallo storico: $targetKey")
        } catch (e: Exception) {
            Log.e(TAG, "Errore nella rimozione dell'assunzione dallo storage nativo", e)
        }
    }

    fun cancelNotification(context: Context, id: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(id)
    }

    private data class NotificationStrings(
        val title: String,
        val body: String,
        val btnDismiss: String,
        val btnTaken: String,
        val btnSnooze: String
    )
}
