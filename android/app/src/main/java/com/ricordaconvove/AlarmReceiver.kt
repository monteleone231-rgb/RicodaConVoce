package com.ricordaconvove

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_MARK_TAKEN = "com.ricordaconvove.ACTION_MARK_TAKEN"
        const val ACTION_SNOOZE = "com.ricordaconvove.ACTION_SNOOZE"
        private const val TAG = "AlarmReceiver"
        private const val WAKELOCK_TIMEOUT_MS = 60000L // 1 minute
        const val AUTO_SNOOZE_CALL_MINUTES = 10 // Auto-posticipo dopo 10 minuti durante una chiamata
        const val MANUAL_SNOOZE_MINUTES = 10 // Posticipo manuale di 10 minuti
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        val id = intent.getIntExtra("ALARM_ID", -1)
        val name = intent.getStringExtra("MED_NAME") ?: "Promemoria"
        val voicePrompt = intent.getStringExtra("VOICE_PROMPT") ?: ""
        val dosage = intent.getStringExtra("DOSAGE") ?: ""
        val timeSlot = intent.getStringExtra("TIME_SLOT") ?: ""
        val customVoicePath = intent.getStringExtra("CUSTOM_VOICE_PATH") ?: ""

        // 1. Gestione azione rapida: "Ho preso"
        if (action == ACTION_MARK_TAKEN) {
            Log.d(TAG, "Azione 'Ho preso' ricevuta per $name ($timeSlot, ID: $id)")
            NotificationHelper.cancelNotification(context, id)
            AlarmScheduler(context).cancelAlarm(id)
            try {
                context.stopService(Intent(context, ReminderAlertService::class.java))
            } catch (e: Exception) {
                Log.e(TAG, "Errore arresto servizio su azione Ho Preso", e)
            }
            NotificationHelper.markSlotTaken(context, name, timeSlot)
            return
        }

        // 2. Gestione azione rapida: "Posticipa (10m)"
        if (action == ACTION_SNOOZE) {
            Log.d(TAG, "Azione 'Posticipa' ricevuta per $name (ID: $id)")
            NotificationHelper.cancelNotification(context, id)
            try {
                context.stopService(Intent(context, ReminderAlertService::class.java))
            } catch (e: Exception) {
                Log.e(TAG, "Errore arresto servizio su azione Posticipa", e)
            }
            val snoozeMillis = System.currentTimeMillis() + MANUAL_SNOOZE_MINUTES * 60 * 1000L
            AlarmScheduler(context).scheduleExactAlarm(
                snoozeMillis,
                id,
                name,
                voicePrompt,
                dosage,
                timeSlot,
                customVoicePath
            )
            return
        }

        Log.d(TAG, "Allarme scattato! ID: $id, Nome: $name, Prompt: $voicePrompt, CustomVoicePath: $customVoicePath")

        // 3. Controllo: l'utente sta parlando al telefono (GSM o WhatsApp/Telegram/VoIP)?
        if (NotificationHelper.isInPhoneCallOrRinging(context)) {
            Log.d(TAG, "Chiamata attiva rilevata durante l'allarme! Sopprimo audio/voce e full-screen. Mostro notifica discreta con badge e auto-posticipo tra $AUTO_SNOOZE_CALL_MINUTES min.")

            // Mostra la notifica visiva nella barra di stato in alto con badge / punto rosso sull'icona
            NotificationHelper.showCallQuietNotification(
                context = context,
                id = id,
                medName = name,
                voicePrompt = voicePrompt,
                dosage = dosage,
                timeSlot = timeSlot,
                customVoicePath = customVoicePath,
                snoozeMinutes = AUTO_SNOOZE_CALL_MINUTES
            )

            // Pianifica l'auto-posticipo vocale dopo 5 minuti
            val autoSnoozeMillis = System.currentTimeMillis() + AUTO_SNOOZE_CALL_MINUTES * 60 * 1000L
            AlarmScheduler(context).scheduleExactAlarm(
                timeMillis = autoSnoozeMillis,
                id = id,
                name = name,
                voicePrompt = voicePrompt,
                dosage = dosage,
                timeSlot = timeSlot,
                customVoicePath = customVoicePath
            )
            return
        }

        // 4. Modalità normale (nessuna telefonata): avvia voce/suoneria e overlay a schermo intero
        context.runWithWakeLock("ricordaconvoce::AlarmWakeLockTag", WAKELOCK_TIMEOUT_MS) {
            val serviceIntent = Intent(context, ReminderAlertService::class.java).apply {
                putExtra("ALARM_ID", id)
                putExtra("MED_NAME", name)
                putExtra("VOICE_PROMPT", voicePrompt)
                putExtra("DOSAGE", dosage)
                putExtra("TIME_SLOT", timeSlot)
                putExtra("CUSTOM_VOICE_PATH", customVoicePath)
            }
            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Impossibile avviare ReminderAlertService", e)
            }

            // Attiva notifica e schermata intera con FullScreenIntent
            NotificationHelper.showNotification(context, id, name, voicePrompt, dosage, timeSlot, customVoicePath)
        }
    }
}

inline fun Context.runWithWakeLock(tag: String, timeout: Long, block: () -> Unit) {
    val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
    val wakeLock = powerManager?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, tag)
    try {
        wakeLock?.acquire(timeout)
        block()
    } finally {
        if (wakeLock?.isHeld == true) {
            wakeLock.release()
        }
    }
}
