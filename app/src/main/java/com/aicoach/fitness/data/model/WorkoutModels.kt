package com.aicoach.fitness.data.model

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
