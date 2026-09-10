package com.ricordaconvove

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log
import org.json.JSONArray
import java.util.Calendar

class AlarmReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_MARK_TAKEN = "com.ricordaconvove.ACTION_MARK_TAKEN"
        const val ACTION_SNOOZE = "com.ricordaconvove.ACTION_SNOOZE"
        const val ACTION_DISMISS = "com.ricordaconvove.ACTION_DISMISS"

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

        // 1. Gestione azione rapida da notifica: "Fatto / Ho preso"
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

        // 2. Gestione azione rapida da notifica: "Zittisci / Ferma notifica"
        if (action == ACTION_DISMISS) {
            Log.d(TAG, "Azione 'Zittisci / Ferma' ricevuta per $name (ID: $id)")
            NotificationHelper.cancelNotification(context, id)
            try {
                context.stopService(Intent(context, ReminderAlertService::class.java))
            } catch (e: Exception) {
                Log.e(TAG, "Errore arresto servizio su azione Zittisci", e)
            }
            return
        }

        // 3. Gestione azione rapida da notifica: "Posticipa (10m)"
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

        // 4. Verifica di validità: se l'allarme è stato eliminato o disattivato, scartalo senza suonare
        if (!isAlarmValidAndActive(context, id)) {
            Log.w(TAG, "Allarme scartato perché non più presente o disattivato in active_alarms: ID $id ($name)")
            AlarmScheduler(context).cancelAlarm(id)
            return
        }

        Log.d(TAG, "Allarme valido scattato! ID: $id, Nome: $name, TimeSlot: $timeSlot")

        // 5. Pianifica la PROSSIMA occorrenza per questo promemoria (ripetizione affidabile anche ad app chiusa)
        scheduleNextRecurrence(context, id, name, voicePrompt, dosage, timeSlot, customVoicePath)

        // 6. Controllo: l'utente sta parlando al telefono (GSM o WhatsApp/Telegram/VoIP)?
        if (NotificationHelper.isInPhoneCallOrRinging(context)) {
            Log.d(TAG, "Chiamata attiva rilevata durante l'allarme! Sopprimo audio/voce e full-screen. Mostro notifica discreta con badge e auto-posticipo tra $AUTO_SNOOZE_CALL_MINUTES min.")
            NotificationHelper.showCallQuietNotification(
                context = context,
                id = id,
                medName = name,
                dosage = dosage,
                timeSlot = timeSlot,
                snoozeMinutes = AUTO_SNOOZE_CALL_MINUTES
            )

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

        // 7. Modalità normale (nessuna telefonata): avvia voce/suoneria e notifica con pulsanti interattivi
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

            NotificationHelper.showNotification(context, id, name, voicePrompt, dosage, timeSlot, customVoicePath)
        }
    }

    private fun isAlarmValidAndActive(context: Context, alarmId: Int): Boolean {
        if (alarmId == -1) return true
        val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
        val alarmsJson = prefs.getString("active_alarms", null) ?: return true
        try {
            val array = JSONArray(alarmsJson)
            for (i in 0 until array.length()) {
                val obj = array.optJSONObject(i) ?: continue
                if (obj.optInt("nativeId", -1) == alarmId) {
                    return obj.optBoolean("isActive", true)
                }
            }
            // Se la lista salvata non è vuota ma non contiene questo ID, è un vecchio allarme eliminato
            return false
        } catch (e: Exception) {
            Log.e(TAG, "Errore verifica allarme attivo", e)
            return true
        }
    }

    private fun scheduleNextRecurrence(
        context: Context,
        alarmId: Int,
        name: String,
        voicePrompt: String,
        dosage: String,
        timeSlot: String,
        customVoicePath: String
    ) {
        if (alarmId == -1 || timeSlot.isBlank()) return
        try {
            val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
            val alarmsJson = prefs.getString("active_alarms", null) ?: return
            val array = JSONArray(alarmsJson)
            for (i in 0 until array.length()) {
                val obj = array.optJSONObject(i) ?: continue
                if (obj.optInt("nativeId", -1) == alarmId) {
                    if (!obj.optBoolean("isActive", true)) return

                    val timeStr = obj.optString("time", timeSlot)
                    val timeParts = timeStr.split(":")
                    if (timeParts.size != 2) return
                    val hours = timeParts[0].toIntOrNull() ?: return
                    val minutes = timeParts[1].toIntOrNull() ?: return

                    val frequencyType = obj.optString("frequencyType", "weekly")
                    val monthlyDay = if (obj.has("monthlyDay") && !obj.isNull("monthlyDay")) obj.optInt("monthlyDay") else null
                    val weeklyScheduleList = mutableListOf<Int>()
                    val weeklyJson = obj.optJSONArray("weeklySchedule")
                    if (weeklyJson != null) {
                        for (j in 0 until weeklyJson.length()) {
                            weeklyScheduleList.add(weeklyJson.optInt(j))
                        }
                    }

                    val calendar = Calendar.getInstance().apply {
                        set(Calendar.HOUR_OF_DAY, hours)
                        set(Calendar.MINUTE, minutes)
                        set(Calendar.SECOND, 0)
                        set(Calendar.MILLISECOND, 0)
                        // Aggiunge almeno 1 giorno poiché l'allarme di oggi è già scattato
                        add(Calendar.DAY_OF_YEAR, 1)
                    }

                    for (step in 0 until 366) {
                        if (frequencyType == "monthly") {
                            val currentDayOfMonth = calendar.get(Calendar.DAY_OF_MONTH)
                            if (monthlyDay != null && currentDayOfMonth == monthlyDay) break
                        } else {
                            val currentJsDay = calendar.get(Calendar.DAY_OF_WEEK) - 1
                            if (weeklyScheduleList.contains(currentJsDay)) break
                        }
                        calendar.add(Calendar.DAY_OF_YEAR, 1)
                    }

                    val nextMillis = calendar.timeInMillis
                    AlarmScheduler(context).scheduleExactAlarm(
                        timeMillis = nextMillis,
                        id = alarmId,
                        name = name,
                        voicePrompt = voicePrompt,
                        dosage = dosage,
                        timeSlot = timeStr,
                        customVoicePath = customVoicePath
                    )
                    Log.d(TAG, "Pianificata prossima occorrenza per $name (ID: $alarmId) il ${calendar.time} ($nextMillis)")
                    return
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Errore pianificazione prossima occorrenza per allarme ID: $alarmId", e)
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
