package com.ricordaconvove

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class FullScreenAlertActivity : ComponentActivity() {

    @Suppress("DEPRECATION")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Se l'utente è al telefono, non interferire con la schermata della chiamata
        if (NotificationHelper.isInPhoneCallOrRinging(this)) {
            finish()
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
            val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            km?.requestDismissKeyguard(this, null)
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }

        val id = intent.getIntExtra("ALARM_ID", -1)
        val medName = intent.getStringExtra("MED_NAME") ?: "Promemoria"
        val voicePrompt = intent.getStringExtra("VOICE_PROMPT") ?: ""
        val dosage = intent.getStringExtra("DOSAGE") ?: ""
        val timeSlot = intent.getStringExtra("TIME_SLOT") ?: ""
        val customVoicePath = intent.getStringExtra("CUSTOM_VOICE_PATH") ?: ""
        val hasCustomVoice = customVoicePath.isNotBlank() || java.io.File(filesDir, "custom_voice_${id}.m4a").exists()

        setContent {
            FullScreenAlertScreen(
                medName = medName,
                dosage = dosage,
                timeSlot = timeSlot,
                voicePrompt = voicePrompt,
                hasCustomVoice = hasCustomVoice,
                onTaken = {
                    stopAlertService()
                    NotificationHelper.cancelNotification(this, id)
                    NotificationHelper.markSlotTaken(this, medName, timeSlot)
                    openMainActivity()
                    finish()
                },
                onSnooze = {
                    stopAlertService()
                    NotificationHelper.cancelNotification(this, id)
                    finish()
                }
            )
        }
    }

    override fun onResume() {
        super.onResume()
        if (NotificationHelper.isInPhoneCallOrRinging(this)) {
            android.util.Log.d("FullScreenAlert", "Chiamata attiva rilevata in onResume: chiudo la schermata full-screen")
            stopAlertService()
            finish()
        }
    }

    private fun openMainActivity() {
        try {
            val mainIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(mainIntent)
        } catch (e: Exception) {
            android.util.Log.e("FullScreenAlert", "Error launching MainActivity", e)
        }
    }

    private fun stopAlertService() {
        try {
            stopService(Intent(this, ReminderAlertService::class.java))
        } catch (e: Exception) {
            // Service might not be running
        }
    }
}

@Composable
fun FullScreenAlertScreen(
    medName: String,
    dosage: String = "",
    timeSlot: String = "",
    voicePrompt: String = "",
    hasCustomVoice: Boolean = false,
    onTaken: () -> Unit,
    onSnooze: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF0F172A)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 24.dp)
            ) {
                Text(
                    text = if (hasCustomVoice) "🎙️ VOCE PERSONALE" else "🔊 SVEGLIA VOCALE",
                    color = if (hasCustomVoice) Color(0xFF38BDF8) else Color(0xFFF97316),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = medName,
                    color = Color.White,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    textAlign = TextAlign.Center
                )
                if (dosage.isNotBlank() || timeSlot.isNotBlank()) {
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = listOf(dosage, timeSlot).filter { it.isNotBlank() }.joinToString(" • "),
                        color = Color(0xFFFDBA74),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            if (hasCustomVoice) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0C4A6E)),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "🎙️ Riproduzione del messaggio vocale registrato",
                            color = Color(0xFFBAE6FD),
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            lineHeight = 24.sp
                        )
                        if (voicePrompt.isNotBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "\"$voicePrompt\"",
                                color = Color(0xFFE0F2FE),
                                fontSize = 14.sp,
                                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            } else if (voicePrompt.isNotBlank()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "\"$voicePrompt\"",
                            color = Color(0xFFFEF08A),
                            fontSize = 17.sp,
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.Center,
                            lineHeight = 24.sp
                        )
                    }
                }
            } else {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "PROMEMORIA DA COMPLETARE:",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = medName,
                            color = Color.White,
                            fontSize = 26.sp,
                            fontWeight = FontWeight.ExtraBold,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = onTaken,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(72.dp)
                ) {
                    Text(
                        text = "HO COMPLETATO IL PROMEMORIA",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }

                OutlinedButton(
                    onClick = onSnooze,
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF94A3B8)),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Text(
                        text = "Posticipa di 10 min",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
