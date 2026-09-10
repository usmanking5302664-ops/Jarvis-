package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val JarvisColorScheme = darkColorScheme(
    primary = JarvisCyan,
    onPrimary = Color.Black,
    primaryContainer = JarvisCardBg,
    onPrimaryContainer = JarvisCyanLight,
    secondary = JarvisCyanLight,
    onSecondary = Color.Black,
    secondaryContainer = JarvisCardBorder,
    onSecondaryContainer = JarvisTextPrimary,
    tertiary = JarvisAmber,
    onTertiary = Color.Black,
    background = JarvisDeepBg,
    onBackground = JarvisTextPrimary,
    surface = JarvisSurface,
    onSurface = JarvisTextPrimary,
    surfaceVariant = JarvisCardBg,
    onSurfaceVariant = JarvisTextSecondary,
    outline = JarvisCardBorder,
    error = JarvisRed,
    onError = Color.White
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Jarvis sci-fi UI is permanently immersive high-contrast dark
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = JarvisColorScheme,
        typography = Typography,
        content = content
    )
}

