package com.ricordaconvove

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class AlarmScheduler(private val context: Context) {
    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    fun scheduleExactAlarm(
        timeMillis: Long,
        id: Int,
        name: String,
        voicePrompt: String = "",
        dosage: String = "",
        timeSlot: String = "",
        customVoicePath: String = ""
    ) {
        if (alarmManager == null) return

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            putExtra("ALARM_ID", id)
            putExtra("MED_NAME", name)
            putExtra("VOICE_PROMPT", voicePrompt)
            putExtra("DOSAGE", dosage)
            putExtra("TIME_SLOT", timeSlot)
            putExtra("CUSTOM_VOICE_PATH", customVoicePath)
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        timeMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        timeMillis,
                        pendingIntent
                    )
                }
            } else {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    timeMillis,
                    pendingIntent
                )
            }
            Log.d("AlarmScheduler", "Scheduled alarm for $name (ID: $id) at $timeMillis")
        } catch (e: Exception) {
            Log.e("AlarmScheduler", "Failed to schedule alarm", e)
        }
    }

    fun cancelAlarm(id: Int) {
        if (alarmManager == null) return

        val intent = Intent(context, AlarmReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            id,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )

        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
            Log.d("AlarmScheduler", "Cancelled alarm ID: $id")
        }
    }
}
