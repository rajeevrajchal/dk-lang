import type { Dictionary } from "./en";

export const da: Dictionary = {
  appName: "Dansk Modultest Prep",

  nav: {
    dashboard: "Dashboard",
    class: "Class",
    reports: "Resultater",
    settings: "Indstillinger",
  },

  common: {
    backToDashboard: "← Dashboard",
    loading: "Indlæser...",
    signOut: "Log ud",
    correct: "Rigtigt",
    incorrect: "Forkert",
  },

  login: {
    subtitle: "Modul 1–5 · PD3-eksamensforberedelse",
    loginTab: "Log ind",
    registerTab: "Opret konto",
    nameLabel: "Navn",
    emailLabel: "Email",
    passwordLabel: "Adgangskode",
    submitLogin: "Log ind",
    submitRegister: "Opret konto",
    submitting: "...",
    errorInvalid: "Forkert email eller adgangskode",
    errorGeneric: "Der skete en fejl",
    errorCreateAccount: "Kunne ikke oprette konto",
  },

  dashboard: {
    title: "Dashboard",
    nextActionEyebrow: "Næste anbefalede handling",
    startNow: "Start nu",
    currentModule: "Aktuelt modul",
    statusPerSkill: "Status pr. færdighed",
    contentComingSoon: "Indhold kommer snart",
    attemptsTier: (count, tier) => `${count} forsøg · Tier ${tier}`,
    weakestPoint: (name, pct) => `Svagt punkt: ${name} (${pct}%)`,
    viewClassOverview: "Se moduloversigt →",
    recentActivity: "Seneste aktivitet",
    noAttempts: "Ingen øvelser endnu.",
    activityRow: (moduleId, skill, tier) => `Modul ${moduleId} · ${skill} · Tier ${tier}`,
    mockTestTag: "(mock test)",
    verifiedResults: "Verificerede resultater",
    verifiedResultsCount: (n) => `${n} verificeret${n === 1 ? "" : "e"} resultat${n === 1 ? "" : "er"}`,
    viewAll: "Se alle →",
    uploadProof: "Upload et resultatbevis →",
    noVerifiedResults: "Ingen verificerede resultater endnu.",
    nextAction: {
      focusOn: (constructName, pct) => `Øv læsning: fokuser på '${constructName}' (${pct}% korrekt)`,
      establishBaseline: "10 læseøvelser for at etablere dit udgangspunkt",
      readyForMockTest: (moduleId) => `Du er klar til en mock modultest i læsning for Modul ${moduleId}`,
      continueTier: (tier) => `Fortsæt læsning på Tier ${tier}`,
      continueModul2: "Fortsæt læsning i Modul 2 (andre discipliner kommer snart)",
    },
  },

  class: {
    title: "Class",
    subtitle: "Gennemgå hvert modul i rækkefølge — bestå modultesten for at låse det næste op.",
    continueBadge: "Fortsæt",
    oralOnly: "Kun mundtlig",
    officiallyPassed: "Officielt bestået",
    appReady: "Praksis-klar (app)",
    unlockedForPractice: "Låst op til øvelse",
    lockedStatus: "Låst",
    lockedMessage: "Dette modul er låst. Bestå det forrige moduls test for at låse det op.",
    backToClass: "← Class",
    lessonsAndPractice: "Lektioner & øvelser",
    practiceButton: "Øv",
    moduleTest: "Modultest",
    pd3FinalExam: "PD3 afsluttende eksamen",
    passThresholdNote: "Beståelsesgrænse: 70% pr. disciplin.",
    startTest: "Start test",
    appLabel: "app",
    officialLabel: "officiel",
    discrepancy: "⚠ uoverensstemmelse",
  },

  practice: {
    loadingExercises: "Indlæser øvelser...",
    exerciseComplete: "Øvelse gennemført",
    scoreLine: (correct, total) => `Du fik ${correct} ud af ${total} rigtige.`,
    newRound: "Ny runde",
    backToDashboard: "Tilbage til dashboard",
    question: (i, total) => `Spørgsmål ${i} af ${total}`,
    points: (correct, total) => `Point: ${correct}/${total}`,
    answerButton: "Svar",
    correctFeedback: "Rigtigt!",
    incorrectFeedback: "Forkert.",
    next: "Næste",
    seeResult: "Se resultat",
    chooseEllipsis: "Vælg...",
    trueLabel: "Sandt",
    falseLabel: "Falsk",
    tierReasons: {
      noAttemptsStartTier2: () =>
        "Ingen tidligere forsøg — starter på Tier 2, da du allerede har prøvet den rigtige modultest.",
      heldAtTier: (tier, construct, pct) =>
        `Fastholdt på Tier ${tier}: '${construct}' er på ${pct}% nøjagtighed.`,
      establishingData: (tier) => `Stadig ved at etablere data for Tier ${tier}.`,
      tierNotSolid: (tier, threshold) =>
        `Tier ${tier} er endnu ikke solidt (under ${threshold}% på alle konstruktioner).`,
      allTiersSolid: () => "Alle tiers solide — arbejder på det højeste niveau.",
    },
  },

  exam: {
    introTitle: (moduleId) => `Mock modultest — Læsning, Modul ${moduleId}`,
    introBody:
      "12 spørgsmål, 12 minutter. Ingen ordbog eller hjælpemidler — ligesom den rigtige modultest. Dette er en intern øvelsestest og ikke en officiel eksamen; et bestået resultat her låser næste moduls øvelsesindhold op i appen, men erstatter ikke den rigtige modultest hos dit sprogcenter.",
    startTest: "Start test",
    passedTitle: "Bestået",
    notPassedTitle: "Ikke bestået",
    resultLine: (correct, total, pct) => `${correct} af ${total} rigtige (${pct}%). Grænse for bestået: 70%.`,
    passedNote: "Godt gået — dette låser øvelsesindhold i næste modul op i appen (in-app-signal).",
    backToDashboard: "Tilbage til dashboard",
    question: (i, total) => `Spørgsmål ${i} af ${total}`,
    next: "Næste",
    submit: "Aflever",
  },

  reports: {
    title: "Verificerede resultater",
    subtitle:
      "Upload et resultatbevis eller diplom fra dit sprogcenter (A2B, Clavis, Praxis m.fl.), efter du har taget den rigtige modultest eller PD3. Appen udtrækker felterne til gennemsyn — intet gemmes, før du har bekræftet det. Appen udsteder eller certificerer aldrig en bestået prøve; den registrerer kun, hvad dit dokument siger.",
    uploadPromptIdle: "Klik for at uploade PDF, PNG eller JPEG (maks 15 MB)",
    uploadPromptUploading: "Uploader...",
    loadingLabel: "Indlæser...",
    noReportsYet: "Ingen resultatbeviser uploadet endnu.",
    statusLabels: {
      PENDING_EXTRACTION: "Behandler...",
      PENDING_CONFIRMATION: "Afventer din bekræftelse",
      CONFIRMED: "Bekræftet",
      REJECTED: "Afvist",
    },
    disciplineLabels: {
      mundtlig: "Mundtlig",
      laesning: "Læsning",
      skrivning: "Skrivning",
      skriftlig: "Skriftlig",
    },
    confirmForm: {
      autoExtracted: (pct) => `Automatisk udtrukket felter (tillid: ${pct}%). Ret dem, hvis noget er forkert.`,
      noAutoExtraction: "Ingen automatisk genkendelse tilgængelig — udfyld felterne ud fra dit resultatbevis.",
      sprogcenterLabel: "Sprogcenter",
      sprogcenterPlaceholder: "fx A2B, Clavis, Praxis",
      modulLabel: "Modul",
      moduleOption: (n) => `Modul ${n}`,
      dateLabel: "Dato",
      resultPerDiscipline: "Resultat pr. disciplin",
      pass: "Bestået",
      fail: "Ikke bestået",
      confirmAndSave: "Bekræft og gem",
      saving: "Gemmer...",
      uploadFailed: "Upload fejlede",
      saveFailed: "Kunne ikke gemme",
      genericError: "Fejl",
    },
  },

  settings: {
    title: "Indstillinger",
    language: "Sprog",
    english: "Engelsk",
    danish: "Dansk",
    account: "Konto",
    nameLabel: "Navn",
    emailLabel: "Email",
    signOut: "Log ud",
    learningPrefs: "Læringsindstillinger",
    translateHelperLabel: "Oversættelseshjælp for ord & afsnit",
    translateHelperDesc:
      "Vis klikbare ord og afsnit på læseteksterne med engelske betydninger som standard.",
    on: "Til",
    off: "Fra",
  },

  enums: {
    skills: {
      READING: "Læsning",
      LISTENING: "Lytning",
      WRITING: "Skrivning",
      SPEAKING: "Mundtlig",
    },
    topics: {
      ARBEJDE: "Arbejde",
      UDDANNELSE: "Uddannelse",
      HVERDAGSLIV: "Hverdagsliv",
      MEDBORGERSKAB: "Medborgerskab",
    },
  },

  moduleCopy: {
    1: {
      name: "Modul 1",
      cefrGoal: "A1 -> A2 (mundtligt grundlag)",
      description:
        "Kun mundtligt modul: grundlæggende præsentationer og hverdagsudtryk. Der findes ingen læse-/skriveprøve på dette niveau — uden for scope for den læsningsfokuserede byggerækkefølge, kun med her for moduloversigtens skyld.",
    },
    2: {
      name: "Modul 2",
      cefrGoal: "A2 (tidligt)",
      description:
        "Første modul med en fuld tre-disciplin modultest: mundtlig kommunikation, læsning, skrivning. Læsning bevæger sig fra simple hovedsætninger i nutid (Tier 1) til datid, modalverber og én ledsætning (Tier 2), med mulighed for at strække sig til flere konnektorer og passiv (Tier 3) for elever, der rykker sig hurtigere.",
    },
    3: {
      name: "Modul 3",
      cefrGoal: "A2 -> B1",
      description:
        "Modultest med de samme tre discipliner. Læsning centrerer sig om Tier 2-3: sikker datid, flere konnektorer, passiv og mere komplekse hverdags-/arbejdsemner.",
    },
    4: {
      name: "Modul 4",
      cefrGoal: "B1",
      description:
        "Modultest med de samme tre discipliner. Læsning bevæger sig ind i Tier 3-4: flere ledsætninger, passiv og et første strejf af abstrakt/argumenterende sprog forud for PD3.",
    },
    5: {
      name: "Modul 5 (PD3)",
      cefrGoal: "B2",
      description:
        "Prøve i Dansk 3 — den afsluttende eksamen, ikke en almindelig modultest. To dele: skriftlig og mundtlig, på B2-niveau. Læse-/skriveindhold er Tier 4: abstrakt/argumenterende sprog, indlejrede ledsætninger, holdningsstrukturer. Bygget som sin egen eksamens-simulering med højere indsats, adskilt fra Modul 2-4's mock modultest-flow.",
    },
  },
};
