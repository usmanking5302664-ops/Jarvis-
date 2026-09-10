package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.service.JarvisForegroundService
import com.example.ui.JarvisMainScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.voice.VoiceManager

class MainActivity : ComponentActivity() {

    private lateinit var voiceManager: VoiceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        voiceManager = VoiceManager(this)

        // Initialize persistent background foreground service
        JarvisForegroundService.startService(this)

        setContent {
            MyApplicationTheme {
                JarvisMainScreen(voiceManager = voiceManager)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        voiceManager.destroy()
    }
}

