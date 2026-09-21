/**
 * Native Android Project Source Code, Gradle configuration, GitHub Actions, and Room schema
 */

export interface AndroidFileTreeItem {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'json' | 'yaml' | 'markdown' | 'groovy' | 'properties' | 'toml' | 'bash';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFileTreeItem[] = [
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    language: 'yaml',
    description: 'گردش کار GitHub Actions برای بیلد خودکار گرادل، تولید APK و آپلود آرتیفکت',
    content: `name: Android CI & APK Release Build

on:
  push:
    branches: [ "main", "master", "develop" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

permissions:
  contents: write

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
          cache: 'gradle'

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build Web Application Assets
        run: |
          npm install --legacy-peer-deps
          npm run build
          mkdir -p app/src/main/assets/web
          cp -r dist/* app/src/main/assets/web/

      - name: Configure gradle.properties and Gradle Wrapper
        env:
          GRADLE_OPTS: "-Dandroid.useAndroidX=true -Dandroid.enableJetifier=true -Dandroid.nonTransitiveRClass=true"
        run: |
          mkdir -p gradle/wrapper
          echo "org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8" > gradle.properties
          echo "android.useAndroidX=true" >> gradle.properties
          echo "android.enableJetifier=true" >> gradle.properties
          echo "android.nonTransitiveRClass=true" >> gradle.properties
          echo "kotlin.code.style=official" >> gradle.properties
          echo "org.gradle.configuration-cache=false" >> gradle.properties

          # Download gradle-wrapper.jar if missing
          if [ ! -f gradle/wrapper/gradle-wrapper.jar ] || [ ! -s gradle/wrapper/gradle-wrapper.jar ]; then
            echo "Downloading gradle-wrapper.jar..."
            curl -sSL --retry 3 --retry-delay 2 -o gradle/wrapper/gradle-wrapper.jar https://raw.githubusercontent.com/gradle/gradle/v8.8.0/gradle/wrapper/gradle-wrapper.jar || \
            curl -sSL --retry 3 --retry-delay 2 -o gradle/wrapper/gradle-wrapper.jar https://github.com/gradle/gradle/raw/master/gradle/wrapper/gradle-wrapper.jar
          fi

          chmod +x gradlew || true


      - name: Build with Gradle
        env:
          ORG_GRADLE_PROJECT_android.useAndroidX: "true"
          ORG_GRADLE_PROJECT_android.enableJetifier: "true"
          GRADLE_OPTS: "-Dandroid.useAndroidX=true -Dandroid.enableJetifier=true"
        run: ./gradlew assembleDebug --stacktrace --no-daemon

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        with:
          name: AI-Fitness-Coach-Assistant-Debug-APK
          path: app/build/outputs/apk/debug/*.apk
          retention-days: 14
          if-no-files-found: error
`,
  },
  {
    path: 'gradlew',
    name: 'gradlew',
    language: 'bash',
    description: 'اسکریپت اجرایی استاندارد اجرای گرادل در محیط لینوکس و اوبونتو گیت‌هاب',
    content: `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
APP_HOME="\`cd "\\\`dirname "$0"\\\`" >/dev/null 2>&1 && pwd\`"
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
exec java -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`,
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    description: 'تنظیمات ریشه پروژه اندروید و مخازن وابستگی‌ها (Google, MavenCentral)',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AIFitnessCoachAssistant"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Root)',
    language: 'kotlin',
    description: 'اسکریپت بیلد اصلی ریشه پروژه با پلاگین‌های Android, Kotlin, KSP',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.ksp) apply false
}
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'toml',
    description: 'کاتالوگ نسخه‌های رسمی Gradle Version Catalog با سازگاری کامل Kotlin 1.9.23 و Compose 1.5.11',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
composeCompiler = "1.5.11"
coreKtx = "1.12.0"
junit = "4.13.2"
junitVersion = "1.1.5"
espressoCore = "3.5.1"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.04.01"
room = "2.6.1"
ksp = "1.9.23-1.0.20"
kotlinxSerialization = "1.6.3"
coroutines = "1.8.0"
desugarJdk = "2.0.4"
navigationCompose = "2.7.7"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-compose-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }

# Room Database
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }

# Serialization & Coroutines
kotlinx-serialization-json = { group = "org.jetbrains.kotlinx", name = "kotlinx-serialization-json", version.ref = "kotlinxSerialization" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

# Desugaring
desugar-jdk-libs = { group = "com.android.tools", name = "desugar_jdk_libs", version.ref = "desugarJdk" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
`,
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    description: 'تنظیمات پروژه شامل فعال‌سازی رسمی AndroidX و بهینه‌سازی حافظه گرادل',
    content: `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
kotlin.code.style=official
org.gradle.configuration-cache=false
`,
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    language: 'properties',
    description: 'تنظیمات نسخه رسمی توزیع Gradle Wrapper 8.8',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.8-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    description: 'تنظیمات بیلد ماژول اپلیکیشن با Jetpack Compose, Room و Kotlinx Serialization',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.aicoach.fitness"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.aicoach.fitness"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
        
        resourceConfigurations += listOf("fa", "en")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
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
        kotlinCompilerExtensionVersion = "1.5.11"
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

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Serialization & Coroutines
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    // Desugaring
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
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AIFitnessCoachAssistant"
        tools:targetApi="34">

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
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/aicoach/fitness/presentation/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    description: 'اکتیویتی اصلی نیتیو اندروید با رابط کاربری مدرن Jetpack Compose و تم بدنسازی لوکس',
    content: `package com.aicoach.fitness.presentation

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aicoach.fitness.presentation.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AIFitnessCoachTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = CharcoalDark
                ) {
                    FitnessAppMainContent()
                }
            }
        }
    }
}

@Composable
fun FitnessAppMainContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(90.dp)
                .background(GoldAccent.copy(alpha = 0.15f), shape = RoundedCornerShape(24.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.FitnessCenter,
                contentDescription = "Fitness Icon",
                tint = GoldAccent,
                modifier = Modifier.size(48.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "دستیار هوشمند مربیگری بدنسازی",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "AI Fitness Coach Assistant",
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = ElectricBlue,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CharcoalCard)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "سیستم آماده کار و متصل به دیتابیس Room",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldAccent
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "طراحی علمی بر اساس اصول دکتر شونفلد، مایک اسرافل (RP) و هرم اریک هلمز",
                    fontSize = 11.sp,
                    color = TextSecondary,
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )
            }
        }
    }
}
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

@Entity(tableName = "athlete_profile")
@TypeConverters(FitnessTypeConverters::class)
data class AthleteProfileEntity(
    @PrimaryKey val id: String = "primary_athlete",
    val name: String,
    val age: Int,
    val gender: String,
    val heightCm: Float,
    val weightKg: Float,
    val bodyFatPercentage: Float? = null,
    val experienceLevel: String,
    val trainingHistoryYears: Float,
    val weeklyDays: Int,
    val trainingLocation: String,
    val availableEquipment: List<String> = emptyList(),
    val sessionDurationMinutes: Int,
    val injuries: List<String> = emptyList(),
    val medicalLimitations: List<String> = emptyList(),
    val movementRestrictions: List<String> = emptyList(),
    val exerciseAvoidanceList: List<String> = emptyList(),
    val primaryGoal: String,
    val secondaryGoal: String? = null,
    val targetMuscles: List<String> = emptyList(),
    val timelineWeeks: Int = 8,
    val notes: String? = null,
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
    val chest: Float? = null,
    val waist: Float? = null,
    val shoulders: Float? = null,
    val biceps: Float? = null,
    val thighs: Float? = null,
    val calves: Float? = null,
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
    val programName: String = "",
    
    @SerialName("duration")
    val duration: String = "",
    
    @SerialName("days")
    val days: List<WorkoutDayJson> = emptyList()
)

@Serializable
data class WorkoutDayJson(
    @SerialName("day")
    val day: String = "",
    
    @SerialName("muscle_groups")
    val muscleGroups: List<String> = emptyList(),
    
    @SerialName("exercises")
    val exercises: List<ExerciseItemJson> = emptyList()
)

@Serializable
data class ExerciseItemJson(
    @SerialName("name")
    val name: String = "",
    
    @SerialName("sets")
    val sets: String = "3",
    
    @SerialName("reps")
    val reps: String = "8-12",
    
    @SerialName("rest")
    val rest: String = "90",
    
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
    description: 'تم اختصاصی بدنسازی لوکس (Dark Charcoal, Gold Accents, Blue Highlights)',
    content: `package com.aicoach.fitness.presentation.theme

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
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        MaterialTheme(
            colorScheme = FitnessDarkColorScheme,
            typography = Typography,
            content = content
        )
    }
}
`,
  },
];
