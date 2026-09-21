# Proguard rules for AI Fitness Coach Assistant
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
-keep class com.aicoach.fitness.data.model.** { *; }
-keep class com.aicoach.fitness.data.local.entity.** { *; }
-dontwarn kotlinx.serialization.**
