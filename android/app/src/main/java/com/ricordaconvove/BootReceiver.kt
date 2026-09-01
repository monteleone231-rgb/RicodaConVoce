package com.ricordaconvove

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import org.json.JSONArray
import org.json.JSONException
import java.util.Calendar

private const val TAG = "BootReceiver"

class BootReceiver : BroadcastReceiver() {
    private val bootActions = setOf(
        Intent.ACTION_BOOT_COMPLETED,
        "android.intent.action.QUICKBOOT_POWERON"
    )

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action
        Log.d(TAG, "onReceive: Boot event detected with action=$action")

        if (action in bootActions) {
            Log.i(TAG, "RicordaConVoce: System restarted. Re-scheduling active reminders...")
            rescheduleAlarms(context)
        }
    }

    private fun rescheduleAlarms(context: Context) {
        val prefs = context.getSharedPreferences("RicordaConVocePrefs", Context.MODE_PRIVATE)
        val alarmsJson = prefs.getString("active_alarms", null)
        if (alarmsJson.isNullOrEmpty()) {
            Log.i(TAG, "No active alarms found to re-schedule.")
            return
        }

        try {
            val jsonArray = JSONArray(alarmsJson)
            val scheduler = AlarmScheduler(context)
            Log.d(TAG, "Found ${jsonArray.length()} saved alarms to re-schedule.")

            for (i in 0 until jsonArray.length()) {
                val alarmObj = jsonArray.optJSONObject(i) ?: continue
                val id = alarmObj.optInt("nativeId", -1)
                val name = alarmObj.optString("name", "Promemoria")
                val timeStr = alarmObj.optString("time", "") // Format "HH:MM"
                val isActive = alarmObj.optBoolean("isActive", false)

                if (id == -1 || timeStr.isEmpty() || !isActive) {
                    continue
                }

                val frequencyType = alarmObj.optString("frequencyType", "weekly")
                val monthlyDay = if (alarmObj.has("monthlyDay") && !alarmObj.isNull("monthlyDay")) alarmObj.optInt("monthlyDay") else null
                
                val weeklyScheduleList = mutableListOf<Int>()
                val weeklyScheduleJson = alarmObj.optJSONArray("weeklySchedule")
                if (weeklyScheduleJson != null) {
                    for (j in 0 until weeklyScheduleJson.length()) {
                        weeklyScheduleList.add(weeklyScheduleJson.optInt(j))
                    }
                }

                val timeParts = timeStr.split(":")
                if (timeParts.size != 2) continue
                val hours = timeParts[0].toIntOrNull() ?: continue
                val minutes = timeParts[1].toIntOrNull() ?: continue

                val calendar = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, hours)
                    set(Calendar.MINUTE, minutes)
                    set(Calendar.SECOND, 0)
                    set(Calendar.MILLISECOND, 0)
                }

                if (calendar.timeInMillis <= System.currentTimeMillis()) {
                    calendar.add(Calendar.DAY_OF_YEAR, 1)
                }

                // Find the first matching day in the next 366 days
                for (step in 0 until 366) {
                    if (frequencyType == "monthly") {
                        val currentDayOfMonth = calendar.get(Calendar.DAY_OF_MONTH)
                        if (monthlyDay != null && currentDayOfMonth == monthlyDay) {
                            break
                        }
                    } else {
                        // Weekly
                        val currentJsDay = calendar.get(Calendar.DAY_OF_WEEK) - 1 // Calendar.SUNDAY = 1 -> 0
                        if (weeklyScheduleList.contains(currentJsDay)) {
                            break
                        }
                    }
                    calendar.add(Calendar.DAY_OF_YEAR, 1)
                }

                val voicePrompt = alarmObj.optString("voicePrompt", "")
                val dosage = alarmObj.optString("dosage", "")
                var customVoicePath = alarmObj.optString("customVoicePath", "")
                if (customVoicePath.isBlank()) {
                    val fileById = java.io.File(context.filesDir, "custom_voice_${id}.m4a")
                    if (fileById.exists() && fileById.length() > 0) {
                        customVoicePath = fileById.absolutePath
                    }
                }

                val timeMillis = calendar.timeInMillis
                scheduler.scheduleExactAlarm(timeMillis, id, name, voicePrompt, dosage, timeStr, customVoicePath)
                Log.d(TAG, "Re-scheduled alarm: $name (ID: $id) at $timeStr (Target: $timeMillis, CustomVoice: $customVoicePath)")
            }
        } catch (e: JSONException) {
            Log.e(TAG, "Error parsing active alarms JSON", e)
        }
    }
}
