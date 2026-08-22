// Canonical UI dictionary. Shape drives the `Dictionary` type that every
// other locale must match exactly (see da.ts). Only UI chrome lives here —
// the Danish reading passages/questions themselves are learning content and
// are never translated (see components/TranslatablePassage.tsx for the
// separate word/paragraph gloss feature that explains them instead).

export const en = {
  appName: "Dansk Modultest Prep",

  nav: {
    dashboard: "Dashboard",
    class: "Class",
    reports: "Reports",
    settings: "Settings",
  },

  common: {
    backToDashboard: "← Dashboard",
    loading: "Loading...",
    signOut: "Sign out",
    correct: "Correct",
    incorrect: "Incorrect",
  },

  login: {
    subtitle: "Modul 1–5 · PD3 exam prep",
    loginTab: "Log in",
    registerTab: "Create account",
    nameLabel: "Name",
    emailLabel: "Email",
    passwordLabel: "Password",
    submitLogin: "Log in",
    submitRegister: "Create account",
    submitting: "...",
    errorInvalid: "Invalid email or password",
    errorGeneric: "Something went wrong",
    errorCreateAccount: "Could not create account",
  },

  dashboard: {
    title: "Dashboard",
    nextActionEyebrow: "Recommended next step",
    startNow: "Start now",
    currentModule: "Current module",
    statusPerSkill: "Status by skill",
    contentComingSoon: "Content coming soon",
    attemptsTier: (count: number, tier: number) => `${count} attempts · Tier ${tier}`,
    weakestPoint: (name: string, pct: number) => `Weak point: ${name} (${pct}%)`,
    viewClassOverview: "View class overview →",
    recentActivity: "Recent activity",
    noAttempts: "No exercises yet.",
    activityRow: (moduleId: number, skill: string, tier: number) =>
      `Module ${moduleId} · ${skill} · Tier ${tier}`,
    mockTestTag: "(mock test)",
    verifiedResults: "Verified results",
    verifiedResultsCount: (n: number) => `${n} verified result${n === 1 ? "" : "s"}`,
    viewAll: "View all →",
    uploadProof: "Upload a result certificate →",
    noVerifiedResults: "No verified results yet.",
    nextAction: {
      focusOn: (constructName: string, pct: number) =>
        `Practice reading: focus on '${constructName}' (${pct}% correct)`,
      establishBaseline: "10 reading exercises to set your baseline",
      readyForMockTest: (moduleId: number) =>
        `You're ready for a mock reading modultest for Module ${moduleId}`,
      continueTier: (tier: number) => `Continue reading at Tier ${tier}`,
      continueModul2: "Continue reading in Module 2 (other skills coming soon)",
    },
  },

  class: {
    title: "Class",
    subtitle: "Work through each module in order — pass the module test to unlock the next one.",
    continueBadge: "Continue",
    oralOnly: "Oral only",
    officiallyPassed: "Officially passed",
    appReady: "Practice-ready (app)",
    unlockedForPractice: "Unlocked for practice",
    lockedStatus: "Locked",
    lockedMessage: "This module is locked. Pass the previous module's test to unlock it.",
    backToClass: "← Class",
    lessonsAndPractice: "Lessons & practice",
    practiceButton: "Practice",
    moduleTest: "Module test",
    pd3FinalExam: "PD3 final exam",
    passThresholdNote: "Pass threshold: 70% per discipline.",
    startTest: "Start test",
    appLabel: "app",
    officialLabel: "official",
    discrepancy: "⚠ discrepancy",
    theorySection: "Theory & grammar",
    theorySectionDesc: "Learn the rules before you practice them.",
    openTheory: "Open theory",
  },

  theory: {
    title: "Theory & grammar",
    subtitle:
      "The grammar behind this module's reading texts. Lessons are written in English so the explanations are easy to follow — the Danish examples are the part you're learning.",
    backToModule: "← Module",
    backToTheory: "← Theory",
    tierLabel: (tier: number) => `Tier ${tier}`,
    lessonsCount: (n: number) => `${n} lesson${n === 1 ? "" : "s"}`,
    readLesson: "Read",
    teaches: "Teaches",
    notTestedYet: "Background — not separately tested",
    examples: "Examples",
    watchOut: "Watch out",
    relatedPractice: "Practice this",
    notFound: "That lesson doesn't exist.",
  },

  exercises: {
    sectionTitle: "Modultest opgaver",
    sectionDesc: "Practise the real test formats, one opgave at a time.",
    open: "Start opgave",
    categories: {
      READING: "Læsning",
      WRITING: "Skrivning",
      SPEAKING: "Tale",
      LISTENING: "Lytning",
    } as Record<string, string>,
    categorySubtitles: {
      READING: "Four task formats from the real Modul 2 reading test",
      WRITING: "Email and short-text tasks",
      SPEAKING: "Interview and situation prompts",
      LISTENING: "Not available yet",
    } as Record<string, string>,
    opgaveLabel: (n: number) => `Opgave ${n}`,
    newBadge: "NEW",
    topicLabel: "Topic",
    loading: "Loading exercise...",
    generating: "Writing you a new exercise...",
    generatingNote: "This takes a few seconds — the text and the questions are being written fresh.",
    generatedBadge: "Generated",
    noneAvailable: "No exercises are available for this category yet.",
    listeningUnavailable:
      "Listening exercises need audio, which this app does not generate yet. The exercise types are defined and ready — showing you text and calling it listening would not rehearse the skill, so nothing is offered here for now.",
    example: "Example",
    submit: "Aflever",
    answeredProgress: (answered: number, total: number) => `${answered} of ${total} answered`,
    resultTitle: "Result",
    scoreLine: (correct: number, total: number) => `You got ${correct} of ${total} correct.`,
    perfect: "No mistakes — well done.",
    mistakesLine: (n: number) => `${n} mistake${n === 1 ? "" : "s"}.`,
    yourAnswer: "Your answer",
    correctAnswer: "Correct",
    notAnswered: "Not answered",
    nextExercise: "Next exercise",
    backToModule: "← Module",
    // Task-specific prompts
    chooseAd: "Choose advert",
    choosePerson: "Choose person",
    chooseSentenceHint: "Click the sentence that does not belong.",
    wordBank: "Word bank",
    wordBankNote: "Use each word once. Four words are not needed.",
    blankLabel: (n: number) => `Nr. ${n}`,
    people: "People",
    ads: "Adverts",
    // Writing
    situation: "Situation",
    task: "Opgave",
    yourText: "Your text",
    writingPlaceholder: "Skriv dit svar her...",
    wordCount: (n: number) => `${n} words`,
    minWordsNote: (n: number) => `Minimum ${n} words`,
    belowMinimum: "You are below the minimum word count.",
    mustInclude: "Your text must include",
    writingSubmitted: "Saved. Check your text against the list below.",
    // Speaking
    stageLabel: (n: number) => `Fase ${n}`,
    roleExaminer: "Eksaminator",
    rolePartner: "Partner",
    roleSolo: "Du taler",
    approxMinutes: (n: number) => `ca. ${n} min`,
    mindmapHint: "The keywords are support, not a checklist — you do not have to use them all, or in order.",
    sharedContext: "You both know",
    youKnow: "You know",
    youMustAsk: "You must find out",
    topicOption: (n: number) => `Topic ${n}`,
    conversation: "Conversation",
    conversationIntro: "Say your answer out loud, then type it so the examiner can respond.",
    yourAnswerLabel: "Your answer",
    answerPlaceholder: "Skriv, hvad du sagde...",
    send: "Send",
    thinking: "The examiner is thinking...",
    startConversation: "Start the conversation",
    conversationDone: "That is the end of this opgave.",
    coveredLabel: "Talked about",
    uncoveredLabel: "Not yet",
    scriptedNotice:
      "Running from the exercise's own follow-up list — set ANTHROPIC_API_KEY for questions that react to what you actually say.",
    selfCheck: "How did it go?",
    speakingIntro: "Answer out loud in Danish. There is nothing to type.",
    followUps: "Follow-up questions",
    usefulPhrases: "Useful phrases",
    markDone: "Jeg er færdig",
    speakingDone: "Marked as completed.",
    // History
    history: "Your history",
    historyEmpty: "No exercises completed yet.",
    historyMistakes: (n: number) => `${n} mistake${n === 1 ? "" : "s"}`,
    historyCompleted: "completed",
  },

  mockTest: {
    title: "Mock modultest",
    subtitle: "Læsning Opgave 1–4 and one Skrivning task, in one sitting.",
    introBody:
      "This follows the running order of the real Modul 2 modultest, shortened: the four reading opgaver, then a writing task. You get one attempt at each — answers are not shown until you hand the whole test in, just like the real thing. No dictionary or aids.",
    structure: "What the test contains",
    readingPart: "Læsning — Opgave 1, 2, 3 and 4",
    writingPart: "Skrivning — one task",
    timeLimit: (minutes: number) => `${minutes} minutes for the whole test`,
    disclaimer:
      "This is an internal practice test, not an official exam. A pass here unlocks the next module's content in the app; it does not replace the real modultest at your sprogcenter.",
    preparing: "Preparing your test...",
    preparingNote: "Writing the four reading opgaver and the writing task.",
    start: "Start test",
    partProgress: (current: number, total: number) => `Part ${current} of ${total}`,
    next: "Next opgave",
    finish: "Hand in test",
    confirmFinish: "Hand the test in? You cannot change your answers afterwards.",
    unanswered: (n: number) => `${n} unanswered`,
    // Results
    resultTitle: "Test result",
    readingResult: "Læsning",
    writingResult: "Skrivning",
    readingScore: (correct: number, total: number, pct: number) =>
      `${correct} of ${total} correct (${pct}%)`,
    passed: "Passed",
    notPassed: "Not passed",
    thresholdNote: (pct: number) => `Pass threshold: ${pct}%`,
    passedNote:
      "This unlocks the next module's practice content in the app (in-app signal only).",
    writingNotScored:
      "Writing is not scored automatically — there is no examiner here. Your text is saved so you can compare it against the checklist, or show it to your teacher.",
    writingWordCount: (n: number, min: number) => `You wrote ${n} words (minimum ${min}).`,
    writingSkipped: "You did not hand in a written answer.",
    perPart: "Per opgave",
    reviewAnswers: "Your answers",
    backToModule: "Back to module",
    retake: "Take another mock test",
  },

  explain: {
    show: "Explain this text",
    hide: "Hide explanation",
    title: "Explanation",
    intro:
      "The whole passage broken down — what it means, how each sentence is built, and what every word is doing.",
    wholeText: "What the text says",
    sentenceBreakdown: "Sentence by sentence",
    structureLabel: "Grammar",
    wordByWord: "Word by word",
    colWord: "Word",
    colMeaning: "Meaning",
    colDictionary: "Dictionary form",
    colHow: "How this form works",
    grammarAtPlay: "Grammar in this text",
    openLesson: "Read the rule →",
    // Post-answer breakdown of an opgave's text
    explainOpgave: "Why? Explain this text",
    hideOpgave: "Hide explanation",
    working: "Reading the text and working through the grammar...",
    workingNote: "This takes a moment — every sentence and word is being explained.",
    unavailableTitle: "Explanation not available",
    unavailableNoKey:
      "The word-by-word explanation is written on demand and needs an ANTHROPIC_API_KEY to be configured. The answer explanations above are always available.",
    unavailableGeneric: "Could not produce an explanation for this text.",
    answerReasons: "Why these answers",
    noExplanation:
      "No detailed explanation has been written for this passage yet. Try the word-level translations by clicking individual words.",
  },

  practice: {
    loadingExercises: "Loading exercises...",
    exerciseComplete: "Exercise complete",
    scoreLine: (correct: number, total: number) => `You got ${correct} out of ${total} right.`,
    newRound: "New round",
    backToDashboard: "Back to dashboard",
    question: (i: number, total: number) => `Question ${i} of ${total}`,
    points: (correct: number, total: number) => `Points: ${correct}/${total}`,
    answerButton: "Answer",
    correctFeedback: "Correct!",
    incorrectFeedback: "Incorrect.",
    next: "Next",
    seeResult: "See result",
    chooseEllipsis: "Choose...",
    trueLabel: "True",
    falseLabel: "False",
    tierReasons: {
      noAttemptsStartTier2: () =>
        "No previous attempts — starting at Tier 2, since you've already sat the real modultest.",
      heldAtTier: (tier: number, construct: string, pct: number) =>
        `Held at Tier ${tier}: '${construct}' is at ${pct}% accuracy.`,
      establishingData: (tier: number) => `Still establishing data for Tier ${tier}.`,
      tierNotSolid: (tier: number, threshold: number) =>
        `Tier ${tier} isn't solid yet (below ${threshold}% on all constructs).`,
      allTiersSolid: () => "All tiers solid — working at the highest level.",
    },
  },

  exam: {
    introTitle: (moduleId: number) => `Mock modultest — Reading, Module ${moduleId}`,
    introBody:
      "12 questions, 12 minutes. No dictionary or aids — just like the real modultest. This is an internal practice test, not an official exam; a pass here unlocks the next module's practice content in the app, but does not replace the real modultest at your sprogcenter.",
    startTest: "Start test",
    passedTitle: "Passed",
    notPassedTitle: "Not passed",
    resultLine: (correct: number, total: number, pct: number) =>
      `${correct} out of ${total} correct (${pct}%). Pass threshold: 70%.`,
    passedNote: "Well done — this unlocks practice content in the next module (in-app signal).",
    backToDashboard: "Back to dashboard",
    question: (i: number, total: number) => `Question ${i} of ${total}`,
    next: "Next",
    submit: "Submit",
  },

  reports: {
    title: "Verified results",
    subtitle:
      "Upload a result certificate or diploma from your sprogcenter (A2B, Clavis, Praxis, etc.) after taking the real modultest or PD3. The app extracts the fields for review — nothing is saved until you confirm it. The app never issues or certifies a pass; it only records what your document says.",
    uploadPromptIdle: "Click to upload PDF, PNG or JPEG (max 15 MB)",
    uploadPromptUploading: "Uploading...",
    loadingLabel: "Loading...",
    noReportsYet: "No result certificates uploaded yet.",
    statusLabels: {
      PENDING_EXTRACTION: "Processing...",
      PENDING_CONFIRMATION: "Awaiting your confirmation",
      CONFIRMED: "Confirmed",
      REJECTED: "Rejected",
    } as Record<string, string>,
    disciplineLabels: {
      mundtlig: "Oral",
      laesning: "Reading",
      skrivning: "Writing",
      skriftlig: "Written",
    } as Record<string, string>,
    confirmForm: {
      autoExtracted: (pct: number) =>
        `Automatically extracted fields (confidence: ${pct}%). Correct them if anything is wrong.`,
      noAutoExtraction: "No automatic recognition available — fill in the fields from your result certificate.",
      sprogcenterLabel: "Sprogcenter",
      sprogcenterPlaceholder: "e.g. A2B, Clavis, Praxis",
      modulLabel: "Modul",
      moduleOption: (n: number) => `Modul ${n}`,
      dateLabel: "Date",
      resultPerDiscipline: "Result per discipline",
      pass: "Passed",
      fail: "Not passed",
      confirmAndSave: "Confirm and save",
      saving: "Saving...",
      uploadFailed: "Upload failed",
      saveFailed: "Could not save",
      genericError: "Error",
    },
  },

  settings: {
    title: "Settings",
    language: "Language",
    english: "English",
    danish: "Danish",
    account: "Account",
    nameLabel: "Name",
    emailLabel: "Email",
    signOut: "Sign out",
    learningPrefs: "Learning preferences",
    translateHelperLabel: "Word & paragraph translation helper",
    translateHelperDesc:
      "Show clickable words and paragraphs on reading passages with English meanings by default.",
    on: "On",
    off: "Off",
  },

  enums: {
    skills: {
      READING: "Reading",
      LISTENING: "Listening",
      WRITING: "Writing",
      SPEAKING: "Speaking",
    } as Record<string, string>,
    topics: {
      ARBEJDE: "Work",
      UDDANNELSE: "Education",
      HVERDAGSLIV: "Everyday life",
      MEDBORGERSKAB: "Citizenship",
    } as Record<string, string>,
  },

  moduleCopy: {
    1: {
      name: "Modul 1",
      cefrGoal: "A1 -> A2 (oral foundation)",
      description:
        "Oral-only module: basic introductions and everyday expressions. There is no reading/writing test at this level — outside the scope of the reading-focused build order, included here only for the module overview.",
    },
    2: {
      name: "Modul 2",
      cefrGoal: "A2 (early)",
      description:
        "First module with a full three-discipline modultest: oral communication, reading, writing. Reading moves from simple present-tense main clauses (Tier 1) to past tense, modal verbs and one subordinate clause (Tier 2), with room to stretch to more connectors and passive voice (Tier 3) for faster-moving learners.",
    },
    3: {
      name: "Modul 3",
      cefrGoal: "A2 -> B1",
      description:
        "Modultest with the same three disciplines. Reading centers on Tier 2–3: solid past tense, more connectors, passive voice, and more complex everyday/work topics.",
    },
    4: {
      name: "Modul 4",
      cefrGoal: "B1",
      description:
        "Modultest with the same three disciplines. Reading moves into Tier 3–4: more subordinate clauses, passive voice, and a first taste of abstract/argumentative language ahead of PD3.",
    },
    5: {
      name: "Modul 5 (PD3)",
      cefrGoal: "B2",
      description:
        "Prøve i Dansk 3 — the final exam, not a routine modultest. Two parts: written and oral, at B2 level. Reading/writing content is Tier 4: abstract/argumentative language, embedded subordinate clauses, opinion structures. Built as its own higher-stakes exam simulation, separate from Modul 2–4's mock modultest flow.",
    },
  } as Record<number, { name: string; cefrGoal: string; description: string }>,
};

export type Dictionary = typeof en;
