package com.ricordaconvove

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "AlarmReceiver"
        private const val WAKELOCK_TIMEOUT_MS = 60000L // 1 minute
    }

    override fun onReceive(context: Context, intent: Intent) {
        val id = intent.getIntExtra("ALARM_ID", -1)
        val name = intent.getStringExtra("MED_NAME") ?: "Promemoria"
        val voicePrompt = intent.getStringExtra("VOICE_PROMPT") ?: ""
        val dosage = intent.getStringExtra("DOSAGE") ?: ""
        val timeSlot = intent.getStringExtra("TIME_SLOT") ?: ""
        val customVoicePath = intent.getStringExtra("CUSTOM_VOICE_PATH") ?: ""

        Log.d(TAG, "Alarm triggered! ID: $id, Name: $name, Prompt: $voicePrompt, CustomVoicePath: $customVoicePath")

        context.runWithWakeLock("ricordaconvoce::AlarmWakeLockTag", WAKELOCK_TIMEOUT_MS) {
            // Start the ReminderAlertService to play alert audio
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
                Log.e(TAG, "Failed to start ReminderAlertService", e)
            }

            // Trigger visual overlay notification with FullScreenIntent
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
