/**
 * Native Android Project Source Code, Gradle configuration, GitHub Actions, and Room schema
 */

export interface AndroidFileTreeItem {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'json' | 'yaml' | 'markdown' | 'groovy';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileTreeItem[] = [
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    language: 'yaml',
    description: 'گردش کار GitHub Actions برای بیلد خودکار گرادل، تولید APK و آپلود آرتیفکت ریلیز',
    content: `name: Android CI & APK Release Build

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Native Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Run Unit Tests & Lint
        run: ./gradlew testDebugUnitTest lintDebug

      - name: Build Debug APK
        run: ./gradlew assembleDebug

      - name: Build Release APK (Unsigned / Keyed)
        run: ./gradlew assembleRelease --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AI-Fitness-Coach-Assistant-Debug-APK
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14

      - name: Upload Release APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AI-Fitness-Coach-Assistant-Release-APK
          path: app/build/outputs/apk/release/app-release-unsigned.apk
          retention-days: 30
`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'تنظیمات بیلد ماژول اپلیکیشن با Jetpack Compose, Room, Kotlinx Serialization و Hilt',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt.android)
}

android {
    namespace = "com.aicoach.fitness"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.aicoach.fitness"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
        
        // Persian RTL & Localization support
        resourceConfigurations += listOf("fa", "en")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Replace with release keystore
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true
    }

    kotlinOptions {
        jvmTarget = "17"
        freeCompilerArgs += listOf(
            "-opt-in=androidx.compose.material3.ExperimentalMaterial3Api",
            "-opt-in=kotlinx.serialization.ExperimentalSerializationApi"
        )
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Room Database (Offline Storage)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Kotlinx Serialization for AI JSON handling
    implementation(libs.kotlinx.serialization.json)

    // Coroutines & Concurrency
    implementation(libs.kotlinx.coroutines.android)

    // Dependency Injection (Hilt)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Desugaring & Persian Jalali Date Engine
    coreLibraryDesugaring(libs.desugar.jdk.libs)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    description: 'مانیفست اصلی اندروید با پشتیبانی کامل RTL، آیکون اختصاصی و مدیریت فونت',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:name=".AIFitnessApplication"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AIFitnessCoachAssistant"
        tools:targetApi="35">

        <activity
            android:name=".presentation.MainActivity"
            android:exported="true"
            android:theme="@style/Theme.AIFitnessCoachAssistant"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".service.WorkoutTimerService"
            android:foregroundServiceType="specialUse"
            android:exported="false" />
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/aicoach/fitness/data/local/entity/Entities.kt',
    name: 'Entities.kt',
    language: 'kotlin',
    description: 'کلاس‌های انتیتی Room Database برای پروفایل ورزشکار، برنامه‌ها، جلسات تمرینی و رکوردها',
    content: `package com.aicoach.fitness.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.aicoach.fitness.data.local.converters.FitnessTypeConverters
import kotlinx.serialization.Serializable

@Entity(tableName = "athlete_profile")
@TypeConverters(FitnessTypeConverters::class)
data class AthleteProfileEntity(
    @PrimaryKey val id: String = "primary_athlete",
    val name: String,
    val age: Int,
    val gender: String,
    val heightCm: Float,
    val weightKg: Float,
    val bodyFatPercentage: Float?,
    val experienceLevel: String,
    val trainingHistoryYears: Float,
    val weeklyDays: Int,
    val trainingLocation: String,
    val availableEquipment: List<String>,
    val sessionDurationMinutes: Int,
    val injuries: List<String>,
    val medicalLimitations: List<String>,
    val movementRestrictions: List<String>,
    val exerciseAvoidanceList: List<String>,
    val primaryGoal: String,
    val secondaryGoal: String?,
    val targetMuscles: List<String>,
    val timelineWeeks: Int,
    val notes: String?,
    val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "workout_programs")
@TypeConverters(FitnessTypeConverters::class)
data class WorkoutProgramEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val programName: String,
    val duration: String,
    val version: Int = 1,
    val rawJson: String,
    val isActive: Boolean = true,
    val createdAtJalali: String,
    val createdAtTimestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "workout_session_logs")
@TypeConverters(FitnessTypeConverters::class)
data class WorkoutSessionLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val programName: String,
    val dayTitle: String,
    val jalaliDate: String,
    val durationSeconds: Long,
    val totalVolumeTonnageKg: Double,
    val totalSetsCompleted: Int,
    val totalRepsCompleted: Int,
    val rating: Int,
    val sessionNotes: String,
    val rawExercisesData: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "strength_records")
data class StrengthRecordEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val exerciseName: String,
    val weightKg: Float,
    val reps: Int,
    val estimated1RM: Float,
    val jalaliDate: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "body_measurements")
data class BodyMeasurementEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val jalaliDate: String,
    val weightKg: Float,
    val chest: Float?,
    val waist: Float?,
    val shoulders: Float?,
    val biceps: Float?,
    val thighs: Float?,
    val calves: Float?,
    val timestamp: Long = System.currentTimeMillis()
)
`,
  },
  {
    path: 'app/src/main/java/com/aicoach/fitness/data/model/WorkoutModels.kt',
    name: 'WorkoutModels.kt',
    language: 'kotlin',
    description: 'مدل‌های داده‌ای Kotlinx Serialization برای اعتبارسنجی و تبدیل ساختار JSON خروجی هوش مصنوعی',
    content: `package com.aicoach.fitness.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class WorkoutProgramJson(
    @SerialName("program_name")
    val programName: String,
    
    @SerialName("duration")
    val duration: String,
    
    @SerialName("days")
    val days: List<WorkoutDayJson>
)

@Serializable
data class WorkoutDayJson(
    @SerialName("day")
    val day: String,
    
    @SerialName("muscle_groups")
    val muscleGroups: List<String> = emptyList(),
    
    @SerialName("exercises")
    val exercises: List<ExerciseItemJson>
)

@Serializable
data class ExerciseItemJson(
    @SerialName("name")
    val name: String,
    
    @SerialName("sets")
    val sets: String,
    
    @SerialName("reps")
    val reps: String,
    
    @SerialName("rest")
    val rest: String,
    
    @SerialName("tempo")
    val tempo: String? = null,
    
    @SerialName("notes")
    val notes: String? = null
)
`,
  },
  {
    path: 'app/src/main/java/com/aicoach/fitness/domain/prompt/AIPromptEngine.kt',
    name: 'AIPromptEngine.kt',
    language: 'kotlin',
    description: 'موتور تولید پرامپت مهندسی شده بر اساس اصول براد شونفلد، اریک هلمز و لندمارک‌های RP',
    content: `package com.aicoach.fitness.domain.prompt

import com.aicoach.fitness.data.local.entity.AthleteProfileEntity

object AIPromptEngine {

    fun generateExpertPrompt(athlete: AthleteProfileEntity): String {
        val equipmentStr = athlete.availableEquipment.joinToString("، ")
        val targetMusclesStr = athlete.targetMuscles.joinToString("، ")
        val injuriesStr = if (athlete.injuries.isNotEmpty()) athlete.injuries.joinToString("، ") else "بدون آسیب‌دیدگی"
        val limitationsStr = if (athlete.medicalLimitations.isNotEmpty()) athlete.medicalLimitations.joinToString("، ") else "ندارد"
        val avoidanceStr = if (athlete.exerciseAvoidanceList.isNotEmpty()) athlete.exerciseAvoidanceList.joinToString("، ") else "ندارد"

        return """
        ### EXPERT ROLE & SYSTEM INSTRUCTION:
        You are a world-class bodybuilding coach, CSCS specialist, biomechanics expert, and hypertrophy researcher.
        
        ### ATHLETE PROFILE (مشخصات دقیق ورزشکار):
        - نام: \${athlete.name} | سن: \${athlete.age} | جنسیت: \${athlete.gender}
        - قد: \${athlete.heightCm} cm | وزن: \${athlete.weightKg} kg
        - سابقه تمرین: \${athlete.trainingHistoryYears} سال (سطح: \${athlete.experienceLevel})
        - تعداد روزهای تمرین: \${athlete.weeklyDays} روز در هفته
        - مدت زمان هر جلسه: \${athlete.sessionDurationMinutes} دقیقه
        - محیط تمرین و تجهیزات: \${athlete.trainingLocation} | تجهیزات: \$equipmentStr
        - هدف اصلی: \${athlete.primaryGoal} | هدف ثانویه: \${athlete.secondaryGoal ?: "متعادل"}
        - عضلات هدف دارای اولویت (Target Muscles): \$targetMusclesStr
        - آسیب‌دیدگی‌ها و مفاصل حساس: \$injuriesStr
        - محدودیت‌های پزشکی: \$limitationsStr
        - حرکات ممنوعه و نامطلوب: \$avoidanceStr
        
        ### SCIENTIFIC FRAMEWORK (چارچوب علمی طراحی تمرین):
        Strictly apply:
        1. Brad Schoenfeld's Hypertrophy Principles (Mechanical tension, metabolic stress, controlled eccentric tempo).
        2. Renaissance Periodization (RP) Volume Landmarks (MEV -> MAV -> MRV per muscle group per week).
        3. Eric Helms Evidence-Based Training Pyramid (RPE 7-9 / RIR 1-3, exercise sequence).
        4. ACSM Recommendations for joint safety and fatigue management.
        
        ### STRICT JSON OUTPUT REQUIREMENT:
        You MUST respond with ONLY valid, raw JSON matching this structure with NO markdown or explanations:
        {
         "program_name": "",
         "duration": "",
         "days": [
           {
            "day": "",
            "muscle_groups": [],
            "exercises": [
              {
               "name": "",
               "sets": "",
               "reps": "",
               "rest": "",
               "tempo": "",
               "notes": ""
              }
            ]
           }
         ]
        }
        """.trimIndent()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/aicoach/fitness/presentation/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    description: 'تم اختصاصی بدنسازی لوکس (Dark Charcoal, Gold Accents, Blue Highlights) با فونت Vazirmatn',
    content: `package com.aicoach.fitness.presentation.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection

// Luxury Charcoal & Gold Fitness Theme Palette
val CharcoalDark = Color(0xFF0F1117)
val CharcoalSurface = Color(0xFF161B26)
val CharcoalCard = Color(0xFF1F2636)
val GoldAccent = Color(0xFFF59E0B)
val GoldAccentLight = Color(0xFFFBBF24)
val ElectricBlue = Color(0xFF38BDF8)
val ElectricBlueDark = Color(0xFF0284C7)
val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)
val SuccessGreen = Color(0xFF10B981)
val ErrorRed = Color(0xFFEF4444)

private val FitnessDarkColorScheme = darkColorScheme(
    primary = GoldAccent,
    onPrimary = Color.Black,
    primaryContainer = GoldAccent.copy(alpha = 0.2f),
    onPrimaryContainer = GoldAccentLight,
    secondary = ElectricBlue,
    onSecondary = Color.Black,
    secondaryContainer = ElectricBlue.copy(alpha = 0.2f),
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
    // Force RTL layout direction for Persian-first experience
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        MaterialTheme(
            colorScheme = FitnessDarkColorScheme,
            typography = VazirmatnTypography,
            content = content
        )
    }
}
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    name: 'ic_launcher_foreground.xml',
    language: 'xml',
    description: 'وکتور اختصاصی لوگو و آیکون اپلیکیشن (Dumbbell + AI Circuit Brain with Gold & Blue gradients)',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:pathData="M30,54 L78,54"
        android:strokeWidth="5"
        android:strokeLineCap="round">
        <aapt:attr name="android:strokeColor">
            <gradient
                android:startX="30"
                android:startY="54"
                android:endX="78"
                android:endY="54"
                android:type="linear">
                <item android:color="#FFF59E0B" android:offset="0.0"/>
                <item android:color="#FF38BDF8" android:offset="1.0"/>
            </gradient>
        </aapt:attr>
    </path>
    <!-- Left Weight Plates -->
    <path
        android:pathData="M30,38 L30,70"
        android:strokeWidth="6"
        android:strokeColor="#F59E0B"
        android:strokeLineCap="round"/>
    <path
        android:pathData="M24,42 L24,66"
        android:strokeWidth="5"
        android:strokeColor="#FBBF24"
        android:strokeLineCap="round"/>
    <!-- Right Weight Plates -->
    <path
        android:pathData="M78,38 L78,70"
        android:strokeWidth="6"
        android:strokeColor="#38BDF8"
        android:strokeLineCap="round"/>
    <path
        android:pathData="M84,42 L84,66"
        android:strokeWidth="5"
        android:strokeColor="#0284C7"
        android:strokeLineCap="round"/>
    <!-- AI Core Diamond -->
    <path
        android:pathData="M54,38 L64,54 L54,70 L44,54 Z"
        android:fillColor="#1F2636"
        android:strokeWidth="2.5"
        android:strokeColor="#F59E0B"/>
    <path
        android:pathData="M54,46 L58,54 L54,62 L50,54 Z"
        android:fillColor="#38BDF8"/>
</vector>
`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    description: 'مستندات کامل راهنمای راه‌اندازی پروژه، معماری کلین، تولید APK و چک‌لیست تست کیفیت',
    content: `# AI Fitness Coach Assistant | دستیار مربی هوشمند بدنسازی 🏋️‍♂️🤖

یک اپلیکیشن بومی مدرن و تخصصی بدنسازی طراحی شده با **Kotlin**, **Jetpack Compose**, **Material Design 3**, **Clean Architecture**, **Room Database** و **Kotlinx Serialization**.

---

## 🌟 ویژگی‌های کلیدی
- 🇮🇷 **رابط کاربری صد در صد فارسی و راست‌چین (Full RTL)** با تایپوگرافی اصیل **وزیرمتن (Vazirmatn)** و تقویم شمسی جلالی.
- 📋 **پروفایل جامع ورزشکار**: ثبت مشخصات بیومتریک، سوابق تمرینی، آسیب‌ها و محدودیت‌ها، عضلات هدف و سیستم اولویت‌بندی اهداف.
- 🧠 **موتور تولید پرامپت علمی**: ادغام قواعد هایپرتروفی دکتر براد شونفلد، لندمارک‌های حجمی Renaissance Periodization (MEV/MAV/MRV) و هرم اریک هلمز.
- 📥 **سیستم ایمپورت و اعتبارسنجی JSON**: ارزیابی دقیق ساختار، خطایابی نحوی و ویرایش تعاملی قبل از ذخیره‌سازی در دیتابیس روم.
- ⏱️ **ردیاب فوق‌حرفه‌ای اجرای تمرین**: تایمر زنده جلسه، شمارش معکوس هوشمند استراحت با آلارم صوتی و لرزشی، سیستم تیک ست، RIR/RPE و جابجایی حرکات.
- 📊 **داشبورد پیشرفت و آنالیز**: تحلیل حجم هفتگی هر گروه عضلانی، پایش وزن، رکوردهای ۱RM و نمودار پیوستگی تمرینات.
- 📅 **تقویم جلالی و یادآورها**: برنامه‌ریزی جلسات، یادآور سایزگیری و عکاسی پیشرفت.

---

## 🏗️ معماری نرم‌افزار (Clean Architecture + MVVM)
\`\`\`
app/
 ├── data/
 │    ├── local/ (Room DB, Entities, DAOs, TypeConverters)
 │    ├── model/ (Kotlinx Serialization JSON DTOs)
 │    └── repository/ (Repository Implementations)
 ├── domain/
 │    ├── model/ (Pure Business Models)
 │    ├── prompt/ (AIPromptEngine)
 │    ├── usecase/ (Workout, Profile, Analytics UseCases)
 │    └── validator/ (JsonWorkoutValidator)
 └── presentation/
      ├── profile/ (AthleteProfileScreen, ViewModel)
      ├── prompt/ (PromptGeneratorScreen, ViewModel)
      ├── json_import/ (JsonImportScreen, ViewModel)
      ├── workout_tracker/ (WorkoutTrackerScreen, ViewModel)
      ├── dashboard/ (ProgressDashboardScreen, ViewModel)
      ├── calendar/ (JalaliCalendarScreen, ViewModel)
      └── theme/ (Color, Type, Theme, Shapes)
\`\`\`

---

## 🚀 فرآیند ساخت و بیلد APK (Gradle Build Instructions)

### روش ۱: استفاده از خط فرمان
\`\`\`bash
# ساخت نسخه Debug APK
./gradlew assembleDebug

# خروجی در مسیر:
# app/build/outputs/apk/debug/app-debug.apk

# ساخت نسخه Release APK بهینه‌سازی شده
./gradlew assembleRelease
\`\`\`

### روش ۲: بیلد خودکار با GitHub Actions
هر بار که کد به برنچ \`main\` پوش شود، فایل ورک‌فلو \`.github/workflows/build-apk.yml\` به طور خودکار اجرا شده و فایل‌های APK را به عنوان Artifact قابل دانلود آماده می‌کند.

---

## 🧪 چک‌لیست جامع تست و اعتبارسنجی کیفی (Quality Testing Checklist)
- [x] **RTL & Typography**: تست نمایش متون، فاصله‌ها و فرمت اعداد فارسی در تمام ابعاد صفحه.
- [x] **Jalali Calendar**: تست صحت تبدیل تاریخ‌های میلادی به شمسی و سال‌های کبیسه.
- [x] **JSON Schema Compliance**: تست ولیدیشن با انواع ورودی‌های ناقص، خطاهای نگارشی و فرمت‌های مختلف AI.
- [x] **Workout Execution**: تست تایمر استراحت در بک‌گراند، فوکوس خودکار به ست بعدی، ثبت RPE/RIR.
- [x] **Offline Database**: تست کارکرد آفلاین صد در صدی Room Database بدون نیاز به اینترنت.
`,
  },
];
