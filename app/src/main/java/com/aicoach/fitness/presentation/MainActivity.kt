package com.aicoach.fitness.presentation

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.aicoach.fitness.presentation.theme.AIFitnessCoachTheme
import com.aicoach.fitness.presentation.theme.CharcoalDark

class MainActivity : ComponentActivity() {

    private var webView: WebView? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView?.canGoBack() == true) {
                    webView?.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        setContent {
            AIFitnessCoachTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = CharcoalDark
                ) {
                    FitnessAppContainer(
                        onWebViewCreated = { webView = it }
                    )
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun FitnessAppContainer(
    onWebViewCreated: (WebView) -> Unit
) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(0xFF0D1017.toInt())

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    setSupportZoom(false)
                }

                webChromeClient = WebChromeClient()
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        return false
                    }
                }

                // Load the exact bundled offline web application
                try {
                    val assetList = context.assets.list("web")
                    if (assetList != null && assetList.contains("index.html")) {
                        loadUrl("file:///android_asset/web/index.html")
                    } else {
                        loadUrl("file:///android_asset/index.html")
                    }
                } catch (e: Exception) {
                    loadUrl("file:///android_asset/web/index.html")
                }

                onWebViewCreated(this)
            }
        }
    )
}


enum class NavigationTab(val title: String, val icon: ImageVector) {
    PROFILE("مشخصات شاگرد", Icons.Default.Person),
    PROMPT_ENGINE("تولید پرامپت هوشمند", Icons.Default.AutoAwesome),
    PROGRAMS("برنامه‌های ذخیره", Icons.Default.FitnessCenter),
    SCIENCE("اصول علمی", Icons.Default.MenuBook)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FitnessAppMainScreen(database: FitnessDatabase) {
    var currentTab by remember { mutableStateOf(NavigationTab.PROFILE) }
    val scope = rememberCoroutineScope()
    val dao = database.fitnessDao()

    // Athlete State
    var name by remember { mutableStateOf("علی رضایی") }
    var age by remember { mutableStateOf("26") }
    var height by remember { mutableStateOf("178") }
    var weight by remember { mutableStateOf("79") }
    var experienceYears by remember { mutableStateOf("3") }
    var weeklyDays by remember { mutableStateOf(4) }
    var experienceLevel by remember { mutableStateOf("متوسط (Intermediate)") }
    var trainingLocation by remember { mutableStateOf("باشگاه مجهز بدنسازی") }
    var primaryGoal by remember { mutableStateOf("هایپرتروفی و عضله‌سازی تخصصی") }
    var selectedEquipment by remember { mutableStateOf(listOf("هالتر و دمبل", "دستگاه‌های سیم‌کش", "دستگاه‌های اسمیت و پرس پا")) }
    var selectedMuscles by remember { mutableStateOf(listOf("سینه (بخش بالایی)", "پشت و زیربغل (لت)", "دلتاویید جانبی (سرشانه)")) }
    var injuries by remember { mutableStateOf("شانه راست (تاندونیت خفیف)") }
    var avoidance by remember { mutableStateOf("پرس سرشانه هالتر از پشت") }
    var generatedPromptText by remember { mutableStateOf("") }
    var savedProgramsList by remember { mutableStateOf<List<WorkoutProgramEntity>>(emptyList()) }

    // Load initial profile from Room DB
    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            dao.getAthleteProfile().collect { profile ->
                if (profile != null) {
                    name = profile.name
                    age = profile.age.toString()
                    height = profile.heightCm.toInt().toString()
                    weight = profile.weightKg.toInt().toString()
                    experienceYears = profile.trainingHistoryYears.toString()
                    weeklyDays = profile.weeklyDays
                    experienceLevel = profile.experienceLevel
                    trainingLocation = profile.trainingLocation
                    primaryGoal = profile.primaryGoal
                    if (profile.availableEquipment.isNotEmpty()) selectedEquipment = profile.availableEquipment
                    if (profile.targetMuscles.isNotEmpty()) selectedMuscles = profile.targetMuscles
                    if (profile.injuries.isNotEmpty()) injuries = profile.injuries.joinToString("، ")
                    if (profile.exerciseAvoidanceList.isNotEmpty()) avoidance = profile.exerciseAvoidanceList.joinToString("، ")
                }
            }
        }
    }

    // Load Saved Programs
    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            dao.getAllWorkoutPrograms().collect { list ->
                savedProgramsList = list
            }
        }
    }

    fun buildCurrentAthlete(): AthleteProfileEntity {
        return AthleteProfileEntity(
            name = name.ifBlank { "ورزشکار" },
            age = age.toIntOrNull() ?: 25,
            gender = "مرد",
            heightCm = height.toFloatOrNull() ?: 175f,
            weightKg = weight.toFloatOrNull() ?: 75f,
            experienceLevel = experienceLevel,
            trainingHistoryYears = experienceYears.toFloatOrNull() ?: 1f,
            weeklyDays = weeklyDays,
            trainingLocation = trainingLocation,
            availableEquipment = selectedEquipment,
            sessionDurationMinutes = 60,
            injuries = if (injuries.isNotBlank()) injuries.split("،", ",").map { it.trim() } else emptyList(),
            exerciseAvoidanceList = if (avoidance.isNotBlank()) avoidance.split("،", ",").map { it.trim() } else emptyList(),
            primaryGoal = primaryGoal,
            targetMuscles = selectedMuscles
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.FitnessCenter,
                            contentDescription = null,
                            tint = GoldAccent,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "مربی هوشمند بدنسازی",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = CharcoalSurface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = CharcoalSurface,
                tonalElevation = 8.dp
            ) {
                NavigationTab.values().forEach { tab ->
                    NavigationBarItem(
                        selected = currentTab == tab,
                        onClick = { currentTab = tab },
                        icon = { Icon(tab.icon, contentDescription = tab.title) },
                        label = {
                            Text(
                                text = tab.title,
                                fontSize = 10.sp,
                                fontWeight = if (currentTab == tab) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = CharcoalDark,
                            selectedTextColor = GoldAccent,
                            indicatorColor = GoldAccent,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary
                        )
                    )
                }
            }
        },
        containerColor = CharcoalDark
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (currentTab) {
                NavigationTab.PROFILE -> ProfileScreen(
                    name = name, onNameChange = { name = it },
                    age = age, onAgeChange = { age = it },
                    height = height, onHeightChange = { height = it },
                    weight = weight, onWeightChange = { weight = it },
                    experienceYears = experienceYears, onExpChange = { experienceYears = it },
                    weeklyDays = weeklyDays, onDaysChange = { weeklyDays = it },
                    experienceLevel = experienceLevel, onLevelChange = { experienceLevel = it },
                    trainingLocation = trainingLocation, onLocationChange = { trainingLocation = it },
                    primaryGoal = primaryGoal, onGoalChange = { primaryGoal = it },
                    injuries = injuries, onInjuriesChange = { injuries = it },
                    avoidance = avoidance, onAvoidanceChange = { avoidance = it },
                    onSaveProfile = {
                        val athlete = buildCurrentAthlete()
                        scope.launch(Dispatchers.IO) {
                            dao.saveAthleteProfile(athlete)
                        }
                    },
                    onGeneratePrompt = {
                        val athlete = buildCurrentAthlete()
                        scope.launch(Dispatchers.IO) {
                            dao.saveAthleteProfile(athlete)
                        }
                        generatedPromptText = AIPromptEngine.generateExpertPrompt(athlete)
                        currentTab = NavigationTab.PROMPT_ENGINE
                    }
                )

                NavigationTab.PROMPT_ENGINE -> PromptEngineScreen(
                    promptText = if (generatedPromptText.isBlank()) {
                        AIPromptEngine.generateExpertPrompt(buildCurrentAthlete())
                    } else generatedPromptText,
                    onRegenerate = {
                        generatedPromptText = AIPromptEngine.generateExpertPrompt(buildCurrentAthlete())
                    },
                    onSaveSampleProgram = {
                        scope.launch(Dispatchers.IO) {
                            dao.insertWorkoutProgram(
                                WorkoutProgramEntity(
                                    programName = "برنامه تخصصی هایپرتروفی ${name}",
                                    duration = "8 هفته - تفکیک و حجم علمی",
                                    rawJson = "{\"status\": \"active\", \"days\": 4}",
                                    createdAtJalali = "1403/06/31"
                                )
                            )
                        }
                    }
                )

                NavigationTab.PROGRAMS -> SavedProgramsScreen(
                    programs = savedProgramsList,
                    onAddPreset = {
                        scope.launch(Dispatchers.IO) {
                            dao.insertWorkoutProgram(
                                WorkoutProgramEntity(
                                    programName = "برنامه 4 روزه Upper / Lower تخصصی RP",
                                    duration = "6 هفته - تمرکز بر لت و سرشانه",
                                    rawJson = "{}",
                                    createdAtJalali = "1403/06/31"
                                )
                            )
                        }
                    }
                )

                NavigationTab.SCIENCE -> SciencePrinciplesScreen()
            }
        }
    }
}

@Composable
fun ProfileScreen(
    name: String, onNameChange: (String) -> Unit,
    age: String, onAgeChange: (String) -> Unit,
    height: String, onHeightChange: (String) -> Unit,
    weight: String, onWeightChange: (String) -> Unit,
    experienceYears: String, onExpChange: (String) -> Unit,
    weeklyDays: Int, onDaysChange: (Int) -> Unit,
    experienceLevel: String, onLevelChange: (String) -> Unit,
    trainingLocation: String, onLocationChange: (String) -> Unit,
    primaryGoal: String, onGoalChange: (String) -> Unit,
    injuries: String, onInjuriesChange: (String) -> Unit,
    avoidance: String, onAvoidanceChange: (String) -> Unit,
    onSaveProfile: () -> Unit,
    onGeneratePrompt: () -> Unit
) {
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CharcoalCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("مشخصات بیومتریک و فردی شاگرد", fontWeight = FontWeight.Bold, color = GoldAccent, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = name,
                    onValueChange = onNameChange,
                    label = { Text("نام ورزشکار / شاگرد", color = TextSecondary) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = age,
                        onValueChange = onAgeChange,
                        label = { Text("سن", color = TextSecondary) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                    )
                    OutlinedTextField(
                        value = height,
                        onValueChange = onHeightChange,
                        label = { Text("قد (cm)", color = TextSecondary) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                    )
                    OutlinedTextField(
                        value = weight,
                        onValueChange = onWeightChange,
                        label = { Text("وزن (kg)", color = TextSecondary) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CharcoalCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("سابقه، روزهای تمرین و هدف", fontWeight = FontWeight.Bold, color = GoldAccent, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(12.dp))

                Text("تعداد روزهای تمرین در هفته: $weeklyDays روز", color = TextPrimary, fontSize = 13.sp)
                Slider(
                    value = weeklyDays.toFloat(),
                    onValueChange = { onDaysChange(it.toInt()) },
                    valueRange = 2f..6f,
                    steps = 3,
                    colors = SliderDefaults.colors(thumbColor = GoldAccent, activeTrackColor = GoldAccent)
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = primaryGoal,
                    onValueChange = onGoalChange,
                    label = { Text("هدف اصلی ورزشی", color = TextSecondary) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = trainingLocation,
                    onValueChange = onLocationChange,
                    label = { Text("محیط تمرین و تجهیزات", color = TextSecondary) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CharcoalCard)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("آسیب‌دیدگی‌ها و حرکات ممنوعه", fontWeight = FontWeight.Bold, color = ErrorRed, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = injuries,
                    onValueChange = onInjuriesChange,
                    label = { Text("آسیب‌دیدگی‌ها یا دردهای مفصلی", color = TextSecondary) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = avoidance,
                    onValueChange = onAvoidanceChange,
                    label = { Text("حرکات ممنوعه یا نامطلوب", color = TextSecondary) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = TextPrimary, unfocusedTextColor = TextPrimary)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedButton(
                onClick = {
                    onSaveProfile()
                    Toast.makeText(context, "مشخصات شاگرد در دیتابیس محلی ذخیره شد", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.weight(1f).height(50.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("ذخیره در دیتابیس", fontSize = 12.sp)
            }

            Button(
                onClick = onGeneratePrompt,
                modifier = Modifier.weight(1f).height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = GoldAccent)
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = CharcoalDark, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("تولید پرامپت هوشمند", color = CharcoalDark, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
        
        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
fun PromptEngineScreen(
    promptText: String,
    onRegenerate: () -> Unit,
    onSaveSampleProgram: () -> Unit
) {
    val clipboard = LocalClipboardManager.current
    val context = LocalContext.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("پرامپت مهندسی‌شده مربیگری (AI Coach)", fontWeight = FontWeight.Bold, color = GoldAccent, fontSize = 15.sp)
            IconButton(onClick = onRegenerate) {
                Icon(Icons.Default.Refresh, contentDescription = "به‌روزرسانی", tint = ElectricBlue)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = CharcoalCard)
        ) {
            SelectionContainer(modifier = Modifier.fillMaxSize().padding(14.dp).verticalScroll(rememberScrollState())) {
                Text(
                    text = promptText,
                    fontSize = 12.sp,
                    color = TextPrimary,
                    lineHeight = 20.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    clipboard.setText(AnnotatedString(promptText))
                    Toast.makeText(context, "پرامپت با موفقیت در کلیپ‌بورد کپی شد", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.weight(1f).height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = ElectricBlue)
            ) {
                Icon(Icons.Default.ContentCopy, contentDescription = null, tint = CharcoalDark)
                Spacer(modifier = Modifier.width(6.dp))
                Text("کپی پرامپت برای هوش مصنوعی", color = CharcoalDark, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }

            OutlinedButton(
                onClick = {
                    onSaveSampleProgram()
                    Toast.makeText(context, "نمونه برنامه در دیتابیس ثبت شد", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.BookmarkAdd, contentDescription = null, tint = GoldAccent)
            }
        }
    }
}

@Composable
fun SavedProgramsScreen(
    programs: List<WorkoutProgramEntity>,
    onAddPreset: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("برنامه‌های ورزشی ذخیره‌شده (${programs.size})", fontWeight = FontWeight.Bold, color = GoldAccent, fontSize = 15.sp)
            Button(
                onClick = onAddPreset,
                colors = ButtonDefaults.buttonColors(containerColor = CharcoalCard),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = GoldAccent, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("افزودن نمونه", color = TextPrimary, fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (programs.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().weight(1f), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.FitnessCenter, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("هنوز برنامه‌ای ذخیره نشده است.", color = TextSecondary, fontSize = 14.sp)
                    Text("از تب پرامپت یا دکمه افزودن، اولین برنامه خود را بسازید.", color = TextSecondary.copy(alpha = 0.7f), fontSize = 12.sp)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize().weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(programs) { prog ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = CharcoalCard)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(prog.programName, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                                Surface(
                                    color = GoldAccent.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Text(
                                        text = prog.createdAtJalali,
                                        color = GoldAccent,
                                        fontSize = 11.sp,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(prog.duration, color = TextSecondary, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SciencePrinciplesScreen() {
    val principles = listOf(
        Pair("1. اصل تنش مکانیکی و حجم تمرینی (Schoenfeld)", "تنش مکانیکی فاکتور اصلی هایپرتروفی است. تمرکز روی دامنه حرکتی کامل (Full ROM) با تمپوی کنترل‌شده ۲ الی ۳ ثانیه در فاز اکسنتریک (منفی)."),
        Pair("2. لندمارک‌های حجم تمرینی (Renaissance Periodization)", "هفته را با حجم حفظ (MV) یا حداقل موثر (MEV) شروع کرده و در طول مزوسایکل تا حجم حداکثر قابل ریکاوری (MRV) افزایش دهید."),
        Pair("3. شدت تلاش و RIR (Eric Helms Pyramid)", "ست‌های موثر باید با RIR بین ۱ تا ۳ (RPE 7 الی 9) اجرا شوند تا حداکثر فراخوانی واحدهای حرکتی رخ دهد بدون خستگی بیش‌ازحد سیستم عصبی."),
        Pair("4. مدیریت خستگی و پیشگیری از آسیب (ACSM)", "تطبیق حرکات با ساختار مفصلی شاگرد و جایگزینی حرکات آسیب‌زا با تمرینات هم‌راستای راستای تارهای عضلانی (Muscle Pennation Angle).")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("چارچوب‌های علمی مربیگری و هایپرتروفی", fontWeight = FontWeight.Bold, color = GoldAccent, fontSize = 16.sp)
        Text("این اپلیکیشن پرامپت‌ها و برنامه‌ها را بر اساس استانداردهای زیر طراحی می‌کند:", color = TextSecondary, fontSize = 12.sp)

        principles.forEach { (title, desc) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = CharcoalCard)
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text(title, fontWeight = FontWeight.Bold, color = ElectricBlue, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(desc, color = TextPrimary, fontSize = 12.sp, lineHeight = 20.sp)
                }
            }
        }
    }
}

