package com.aicoach.fitness.data.local.entity

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
