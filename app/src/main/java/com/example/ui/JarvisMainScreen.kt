package com.example.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.automation.AndroidPhoneController
import com.example.gemini.AndroidGeminiProService
import com.example.service.JarvisForegroundService
import com.example.ui.theme.*
import com.example.voice.VoiceManager
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun JarvisMainScreen(
    voiceManager: VoiceManager,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val isListening by voiceManager.isListening.collectAsState()
    val recognizedText by voiceManager.recognizedText.collectAsState()
    val isSpeaking by voiceManager.isSpeaking.collectAsState()

    var activeTab by remember { mutableStateOf("CORE") }
    var commandInput by remember { mutableStateOf("") }
    var terminalLogs by remember { mutableStateOf(listOf("J.A.R.V.I.S. Core V3.5 Online", "Gemini Pro Model Active", "Ready for voice and automation commands")) }
    var bgServiceActive by remember { mutableStateOf(true) }

    // Arc Reactor rotation animation
    val infiniteTransition = rememberInfiniteTransition(label = "ArcReactor")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (isListening) 4000 else 12000, easing = LinearEasing)
        ),
        label = "rotation"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(JarvisCyan.copy(alpha = 0.2f))
                                .border(1.dp, JarvisCyan, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Bolt, contentDescription = null, tint = JarvisCyan, modifier = Modifier.size(18.dp))
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("J.A.R.V.I.S.", color = JarvisCyanLight, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                            Text("DEVICE CONTROLLER • GEMINI PRO", color = JarvisTextSecondary, fontSize = 9.sp)
                        }
                    }
                },
                actions = {
                    IconButton(onClick = {
                        bgServiceActive = !bgServiceActive
                        if (bgServiceActive) {
                            JarvisForegroundService.startService(context)
                        } else {
                            JarvisForegroundService.stopService(context)
                        }
                    }) {
                        Icon(
                            imageVector = if (bgServiceActive) Icons.Default.Sensors else Icons.Default.SensorsOff,
                            contentDescription = "Background Service",
                            tint = if (bgServiceActive) JarvisGreen else JarvisTextSecondary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = JarvisDeepBg)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = JarvisSurface, tonalElevation = 8.dp) {
                val tabs = listOf(
                    Triple("CORE", "Core", Icons.Default.Bolt),
                    Triple("PHONE", "Controls", Icons.Default.PhoneAndroid),
                    Triple("COURSE", "Courses", Icons.Default.School),
                    Triple("PROMPT", "Prompts", Icons.Default.Terminal),
                    Triple("HTML", "HTML App", Icons.Default.Code)
                )
                tabs.forEach { (id, label, icon) ->
                    NavigationBarItem(
                        selected = activeTab == id,
                        onClick = { activeTab = id },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = JarvisCyan,
                            selectedTextColor = JarvisCyan,
                            indicatorColor = JarvisCardBg
                        )
                    )
                }
            }
        },
        containerColor = JarvisDeepBg
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            when (activeTab) {
                "CORE" -> {
                    Spacer(modifier = Modifier.height(16.dp))

                    // Arc Reactor Centerpiece
                    Box(
                        modifier = Modifier
                            .size(190.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    listOf(Color(0xFF0D2545), Color(0xFF040A14))
                                )
                            )
                            .border(2.dp, if (isListening) JarvisCyan else JarvisCardBorder, CircleShape)
                            .clickable {
                                if (isListening) {
                                    voiceManager.stopListening()
                                } else {
                                    voiceManager.startListening("ur-PK")
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        // Rotating outer ring
                        Box(
                            modifier = Modifier
                                .size(165.dp)
                                .rotate(rotation)
                                .border(1.dp, JarvisCyan.copy(alpha = 0.4f), CircleShape)
                        )

                        // Core
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = if (isListening) Icons.Default.Mic else Icons.Default.MicNone,
                                contentDescription = "Mic",
                                tint = if (isListening) JarvisCyan else JarvisCyanLight,
                                modifier = Modifier.size(44.dp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = if (isListening) "LISTENING..." else "TAP TO COMMAND",
                                color = JarvisCyan,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Voice recognized text preview
                    if (recognizedText.isNotEmpty() || isListening) {
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = JarvisCardBg,
                            shape = RoundedCornerShape(12.dp),
                            border = ButtonDefaults.outlinedButtonBorder
                        ) {
                            Text(
                                text = recognizedText.ifEmpty { "Listening in Urdu / English..." },
                                color = JarvisTextPrimary,
                                modifier = Modifier.padding(12.dp),
                                fontSize = 13.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    // Command text input
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(JarvisSurface, RoundedCornerShape(10.dp))
                            .border(1.dp, JarvisCardBorder, RoundedCornerShape(10.dp))
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextField(
                            value = commandInput,
                            onValueChange = { commandInput = it },
                            placeholder = { Text("وائس کمانڈ دیں یا لکھیں...", color = JarvisTextSecondary, fontSize = 13.sp) },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = JarvisTextPrimary,
                                unfocusedTextColor = JarvisTextPrimary
                            ),
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = {
                            val cmd = commandInput.trim()
                            if (cmd.isNotEmpty()) {
                                terminalLogs = listOf("User: $cmd") + terminalLogs
                                commandInput = ""
                                coroutineScope.launch {
                                    val reply = AndroidGeminiProService.generateContent(cmd)
                                    terminalLogs = listOf("JARVIS: $reply") + terminalLogs
                                    voiceManager.speak(reply)
                                }
                            }
                        }) {
                            Icon(Icons.Default.Send, contentDescription = "Execute", tint = JarvisCyan)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Terminal Logs
                    Text("AUTONOMOUS TASK LOGS", color = JarvisCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.align(Alignment.Start))
                    Spacer(modifier = Modifier.height(6.dp))
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                            .background(JarvisCardBg, RoundedCornerShape(8.dp))
                            .padding(8.dp)
                    ) {
                        items(terminalLogs) { log ->
                            Text("> $log", color = JarvisTextPrimary, fontSize = 11.sp, modifier = Modifier.padding(vertical = 2.dp))
                        }
                    }
                }

                "PHONE" -> {
                    // Quick Phone Controls
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("DEVICE CONTROLLER PROTOCOLS", color = JarvisCyan, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(12.dp))

                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = { AndroidPhoneController.sendSms(context, "", "سلام، میں جلدی پہنچ رہا ہوں۔") },
                            colors = ButtonDefaults.buttonColors(containerColor = JarvisCardBg),
                            border = ButtonDefaults.outlinedButtonBorder,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Message, contentDescription = null, tint = JarvisCyan)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("DISPATCH SMS (ایس ایم ایس بھیجیں)", color = JarvisTextPrimary)
                        }

                        Button(
                            onClick = { AndroidPhoneController.openApp(context, "whatsapp") },
                            colors = ButtonDefaults.buttonColors(containerColor = JarvisCardBg),
                            border = ButtonDefaults.outlinedButtonBorder,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.OpenInNew, contentDescription = null, tint = JarvisGreen)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("LAUNCH WHATSAPP (واٹس ایپ اوپن کریں)", color = JarvisTextPrimary)
                        }

                        Button(
                            onClick = { AndroidPhoneController.searchPlayStore(context, "Instagram") },
                            colors = ButtonDefaults.buttonColors(containerColor = JarvisCardBg),
                            border = ButtonDefaults.outlinedButtonBorder,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, tint = JarvisAmber)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("INSTALL FROM PLAY STORE (پلے اسٹور انسٹال)", color = JarvisTextPrimary)
                        }

                        Button(
                            onClick = { AndroidPhoneController.playSong(context, "Atif Aslam Coke Studio") },
                            colors = ButtonDefaults.buttonColors(containerColor = JarvisCardBg),
                            border = ButtonDefaults.outlinedButtonBorder,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.MusicNote, contentDescription = null, tint = JarvisCyan)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("PLAY MUSIC (سونگ لگائیں)", color = JarvisTextPrimary)
                        }

                        Button(
                            onClick = {
                                AndroidPhoneController.generatePdf(context, "System Telemetry", "JARVIS Core operational status: All systems nominal.")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = JarvisCardBg),
                            border = ButtonDefaults.outlinedButtonBorder,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.PictureAsPdf, contentDescription = null, tint = JarvisRed)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("DOWNLOAD PDF REPORT (پی ڈی ایف ڈاؤنلوڈ)", color = JarvisTextPrimary)
                        }
                    }
                }

                "COURSE" -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("GEMINI PRO COURSE ARCHITECT (کورس میکر)", color = JarvisCyan, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Generate step-by-step masterclasses and export to PDF on demand.", color = JarvisTextSecondary, fontSize = 12.sp)
                }

                "PROMPT" -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("PROMPT STUDIO & META-ENGINEER (پرومٹ اسٹوڈیو)", color = JarvisCyan, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Design and optimize precision AI system prompts and instructions.", color = JarvisTextSecondary, fontSize = 12.sp)
                }

                "HTML" -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("HTML WEB APP MAKER (ایچ ٹی ایم ایل میکر)", color = JarvisCyan, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Generate single-file interactive web apps with Gemini Pro.", color = JarvisTextSecondary, fontSize = 12.sp)
                }
            }
        }
    }
}
