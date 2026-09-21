package com.aicoach.fitness.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.aicoach.fitness.data.local.converters.FitnessTypeConverters
import com.aicoach.fitness.data.local.dao.FitnessDao
import com.aicoach.fitness.data.local.entity.AthleteProfileEntity
import com.aicoach.fitness.data.local.entity.BodyMeasurementEntity
import com.aicoach.fitness.data.local.entity.StrengthRecordEntity
import com.aicoach.fitness.data.local.entity.WorkoutProgramEntity
import com.aicoach.fitness.data.local.entity.WorkoutSessionLogEntity

@Database(
    entities = [
        AthleteProfileEntity::class,
        WorkoutProgramEntity::class,
        WorkoutSessionLogEntity::class,
        StrengthRecordEntity::class,
        BodyMeasurementEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(FitnessTypeConverters::class)
abstract class FitnessDatabase : RoomDatabase() {
    abstract fun fitnessDao(): FitnessDao

    companion object {
        @Volatile
        private var INSTANCE: FitnessDatabase? = null

        fun getDatabase(context: Context): FitnessDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FitnessDatabase::class.java,
                    "ai_fitness_coach_db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
