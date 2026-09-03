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
     * Mostra la notifica standard ad alta priorità con fullScreenIntent quando l'utente non è al telefono.
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
            id,
            fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val hasCustomVoice = customVoicePath.isNotBlank()
        val notifTitle = if (hasCustomVoice) "🎙️ Promemoria con Voce Personale" else "⏰ Ora del promemoria"
        val notifBody = if (dosage.isNotBlank()) "$medName ($dosage)" else "Promemoria: $medName"

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(notifTitle)
            .setContentText(notifBody)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setAutoCancel(true)
            .setOngoing(true)
            .setShowBadge(true)
            .setNumber(1)

        notificationManager.notify(id, builder.build())
    }

    /**
     * Mostra una notifica discreta nella barra di stato in alto quando l'utente è al telefono:
     * - Nessun suono invasivo o voce sull'altoparlante durante la telefonata.
     * - Mostra il badge / punto rosso sull'icona dell'applicazione.
     * - Fornisce azioni rapide: "Ho preso" e "Posticipa".
     * - Informa dell'auto-posticipo vocale dopo i minuti specificati.
     */
    fun showCallQuietNotification(
        context: Context,
        id: Int,
        medName: String,
        voicePrompt: String = "",
        dosage: String = "",
        timeSlot: String = "",
        customVoicePath: String = "",
        snoozeMinutes: Int = 5
    ) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CALL_QUIET_CHANNEL_ID,
                CALL_QUIET_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifiche discrete e punto rosso durante una chiamata in corso"
                setSound(null, null) // Silenziosa per non disturbare la voce in cuffia o all'orecchio
                enableLights(true)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 150) // Vibrazione lieve e delicata
                setShowBadge(true) // Attiva il badge/punto rosso sull'icona dell'app
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Recupera la lingua impostata nelle preferenze
        val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
        val lang = prefs.getString("lang", "it") ?: "it"

        val (titleText, bodyText, btnTakenText, btnSnoozeText) = when {
            lang.startsWith("es") -> Quadruple(
                "📞 Recordatorio: $medName",
                if (dosage.isNotBlank()) "$medName ($dosage) • Alarma vocal en $snoozeMinutes min" else "$medName • Alarma vocal en $snoozeMinutes min",
                "Hecho",
                "Posponer (10m)"
            )
            lang.startsWith("fr") -> Quadruple(
                "📞 Rappel: $medName",
                if (dosage.isNotBlank()) "$medName ($dosage) • Alerte vocale dans $snoozeMinutes min" else "$medName • Alerte vocale dans $snoozeMinutes min",
                "Pris",
                "Reporter (10m)"
            )
            lang.startsWith("de") -> Quadruple(
                "📞 Erinnerung: $medName",
                if (dosage.isNotBlank()) "$medName ($dosage) • Sprachalarm in $snoozeMinutes Min",
                "Erledigt",
                "Schlummern (10m)"
            )
            lang.startsWith("en") -> Quadruple(
                "📞 Reminder: $medName",
                if (dosage.isNotBlank()) "$medName ($dosage) • Voice alert in $snoozeMinutes min" else "$medName • Voice alert in $snoozeMinutes min",
                "Taken",
                "Snooze (10m)"
            )
            else -> Quadruple(
                "📞 Promemoria: $medName",
                if (dosage.isNotBlank()) "$medName ($dosage) • Allarme vocale tra $snoozeMinutes min" else "$medName • Allarme vocale tra $snoozeMinutes min",
                "Ho preso",
                "Posticipa (10m)"
            )
        }

        // Tocco sulla notifica: apre l'app principale senza interrompere bruscamente la chiamata
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context,
            id,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Azione 1: "Ho preso"
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

        // Azione 2: "Posticipa manuale (10 min)"
        val snoozeIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmReceiver.ACTION_SNOOZE
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", medName)
            putExtra("VOICE_PROMPT", voicePrompt)
            putExtra("DOSAGE", dosage)
            putExtra("TIME_SLOT", timeSlot)
            putExtra("CUSTOM_VOICE_PATH", customVoicePath)
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            id * 10 + 2,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, CALL_QUIET_CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(titleText)
            .setContentText(bodyText)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bodyText))
            .setContentIntent(openAppPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setShowBadge(true)
            .setNumber(1)
            .setBadgeIconType(NotificationCompat.BADGE_ICON_SMALL)
            .setAutoCancel(true)
            .addAction(android.R.drawable.checkbox_on_background, btnTakenText, takenPendingIntent)
            .addAction(android.R.drawable.ic_menu_recent_history, btnSnoozeText, snoozePendingIntent)

        notificationManager.notify(id, builder.build())
        Log.d(TAG, "Mostrata notifica discreta e badge per promemoria '$medName' (chiamata in corso)")
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

    fun cancelNotification(context: Context, id: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(id)
    }

    private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
}
