package com.aicoach.fitness.domain.prompt

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
        - نام: ${athlete.name} | سن: ${athlete.age} | جنسیت: ${athlete.gender}
        - قد: ${athlete.heightCm} cm | وزن: ${athlete.weightKg} kg
        - سابقه تمرین: ${athlete.trainingHistoryYears} سال (سطح: ${athlete.experienceLevel})
        - تعداد روزهای تمرین: ${athlete.weeklyDays} روز در هفته
        - مدت زمان هر جلسه: ${athlete.sessionDurationMinutes} دقیقه
        - محیط تمرین و تجهیزات: ${athlete.trainingLocation} | تجهیزات: $equipmentStr
        - هدف اصلی: ${athlete.primaryGoal} | هدف ثانویه: ${athlete.secondaryGoal ?: "متعادل"}
        - عضلات هدف دارای اولویت (Target Muscles): $targetMusclesStr
        - آسیب‌دیدگی‌ها و مفاصل حساس: $injuriesStr
        - محدودیت‌های پزشکی: $limitationsStr
        - حرکات ممنوعه و نامطلوب: $avoidanceStr
        
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
