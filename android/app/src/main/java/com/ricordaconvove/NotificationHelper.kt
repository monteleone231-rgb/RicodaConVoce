package com.ricordaconvove

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

object NotificationHelper {
    private const val CHANNEL_ID = "medivoce_critical_reminders"
    private const val CHANNEL_NAME = "Promemoria Vocali Ricorda con Voce"

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

        notificationManager.notify(id, builder.build())
    }

    fun cancelNotification(context: Context, id: Int) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(id)
    }
}
