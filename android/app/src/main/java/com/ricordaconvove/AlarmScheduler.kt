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
            // Intent to open the app if user taps on the system clock or alarm indicator
            val showIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val showPendingIntent = PendingIntent.getActivity(
                context,
                id,
                showIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // setAlarmClock guarantees to fire at the exact minute even under deep Doze mode
            // and aggressive OEM battery savers (Samsung, Xiaomi, Huawei, etc.)
            val alarmClockInfo = AlarmManager.AlarmClockInfo(timeMillis, showPendingIntent)
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent)
            Log.d("AlarmScheduler", "Scheduled high-priority alarm clock for $name (ID: $id) at $timeMillis")
        } catch (e: SecurityException) {
            Log.w("AlarmScheduler", "setAlarmClock security exception, falling back to setExactAndAllowWhileIdle", e)
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMillis, pendingIntent)
                } else {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMillis, pendingIntent)
                }
            } catch (fallbackEx: Exception) {
                Log.e("AlarmScheduler", "Failed fallback alarm scheduling", fallbackEx)
            }
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
