package com.aicoach.fitness.presentation.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

private val FitnessDarkColorScheme = darkColorScheme(
    primary = GoldAccent,
    onPrimary = Color.Black,
    primaryContainer = Color(0x33F59E0B),
    onPrimaryContainer = GoldAccentLight,
    secondary = ElectricBlue,
    onSecondary = Color.Black,
    secondaryContainer = Color(0x3338BDF8),
    background = CharcoalDark,
    onBackground = TextPrimary,
    surface = CharcoalSurface,
    onSurface = TextPrimary,
    surfaceVariant = CharcoalCard,
    onSurfaceVariant = TextSecondary,
    error = ErrorRed,
    onError = Color.White
)

@Composable
fun AIFitnessCoachTheme(
    content: @Composable () -> Unit
) {
    // Force RTL layout direction for Persian support
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        MaterialTheme(
            colorScheme = FitnessDarkColorScheme,
            typography = Typography,
            content = content
        )
    }
}
