package com.aicoach.fitness.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.aicoach.fitness.data.local.entity.AthleteProfileEntity
import com.aicoach.fitness.data.local.entity.BodyMeasurementEntity
import com.aicoach.fitness.data.local.entity.StrengthRecordEntity
import com.aicoach.fitness.data.local.entity.WorkoutProgramEntity
import com.aicoach.fitness.data.local.entity.WorkoutSessionLogEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FitnessDao {

    @Query("SELECT * FROM athlete_profile WHERE id = 'primary_athlete' LIMIT 1")
    fun getAthleteProfile(): Flow<AthleteProfileEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveAthleteProfile(profile: AthleteProfileEntity)

    @Query("SELECT * FROM workout_programs ORDER BY id DESC")
    fun getAllWorkoutPrograms(): Flow<List<WorkoutProgramEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkoutProgram(program: WorkoutProgramEntity): Long

    @Query("SELECT * FROM workout_session_logs ORDER BY id DESC")
    fun getAllSessionLogs(): Flow<List<WorkoutSessionLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSessionLog(log: WorkoutSessionLogEntity): Long

    @Query("SELECT * FROM strength_records ORDER BY timestamp DESC")
    fun getAllStrengthRecords(): Flow<List<StrengthRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStrengthRecord(record: StrengthRecordEntity)

    @Query("SELECT * FROM body_measurements ORDER BY timestamp DESC")
    fun getAllBodyMeasurements(): Flow<List<BodyMeasurementEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBodyMeasurement(measurement: BodyMeasurementEntity)
}
