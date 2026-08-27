import type { ExerciseVariant } from "@/types";

// Skrivning — realistic DU3 Modul 2 writing tasks.
//
// The email variants follow the reference test exactly in shape: a short
// situation line, a task line, a stated minimum word count, an incoming
// message containing the questions that must all be answered, and an answer
// box with the To/Subject already filled in.
//
// These are not machine-graded. There is no correct answer to check against,
// so the app records them as completed and shows the checklist of points that
// had to be covered — the learner judges their own text against it. Grading
// free text would need a rubric-based marker, which is deliberately out of
// scope rather than faked with a word-count score.

export const WRITING_VARIANTS: ExerciseVariant[] = [
  {
    variantId: "w-email-lejlighed",
    category: "WRITING",
    taskType: "writing_email",
    moduleId: 2,
    topic: "Bolig",
    title: "Svar på en mail om din nye lejlighed",
    instruction: [
      "Læs e-mailen, og skriv et svar til Sofie.",
      "Du skal svare på alle Sofies spørgsmål.",
      "Du skal skrive minimum 70 ord.",
    ],
    difficulty: "medium",
    content: {
      kind: "writing",
      situation: "Du har fået en mail fra din veninde, Sofie.",
      task: "Læs e-mailen, og skriv et svar til Sofie. Du skal svare på alle Sofies spørgsmål. Du skal skrive minimum 70 ord.",
      minWords: 70,
      incomingEmail: {
        from: "Sofie",
        subject: "Ny lejlighed",
        body: "Hej\n\nJeg har hørt, at du er flyttet i en ny lejlighed. Hvor stort tillykke! Jeg vil gerne høre alt om den.\n\nMange hilsner\nSofie",
        questions: [
          "Hvor ligger din nye lejlighed?",
          "Hvor mange værelser er der?",
          "Hvad er det bedste ved den?",
          "Hvornår kan jeg komme på besøg?",
        ],
      },
      answerHeader: { to: "Sofie", subject: "Ny lejlighed" },
      mustInclude: [
        "Hvor lejligheden ligger (by, bydel eller vej)",
        "Hvor mange værelser der er",
        "Hvad du synes er det bedste ved lejligheden",
        "Hvornår Sofie kan komme på besøg",
        "En hilsen i starten og i slutningen",
      ],
    },
  },

  {
    variantId: "w-email-ferie",
    category: "WRITING",
    taskType: "writing_email",
    moduleId: 2,
    topic: "Ferie",
    title: "Svar på en mail om din ferie",
    instruction: [
      "Læs e-mailen, og skriv et svar til Mads.",
      "Du skal svare på alle Mads' spørgsmål.",
      "Du skal skrive minimum 70 ord.",
    ],
    difficulty: "medium",
    content: {
      kind: "writing",
      situation: "Du har fået en mail fra din ven, Mads.",
      task: "Læs e-mailen, og skriv et svar til Mads. Du skal svare på alle Mads' spørgsmål. Du skal skrive minimum 70 ord.",
      minWords: 70,
      incomingEmail: {
        from: "Mads",
        subject: "Din ferie",
        body: "Hej\n\nJeg kan se på Facebook, at du har været på ferie. Det så dejligt ud! Jeg sidder her hjemme i regnvejr og vil gerne høre om turen.\n\nMange hilsner\nMads",
        questions: [
          "Hvor var du henne?",
          "Hvem rejste du sammen med?",
          "Hvad lavede I om dagen?",
          "Vil du gerne tilbage igen?",
        ],
      },
      answerHeader: { to: "Mads", subject: "Din ferie" },
      mustInclude: [
        "Hvor du var henne",
        "Hvem du rejste sammen med",
        "Hvad I lavede om dagen (brug datid)",
        "Om du gerne vil tilbage, og hvorfor",
        "En hilsen i starten og i slutningen",
      ],
    },
  },

  {
    variantId: "w-email-arbejde",
    category: "WRITING",
    taskType: "writing_email",
    moduleId: 2,
    topic: "Arbejde",
    title: "Svar på en mail om dit nye job",
    instruction: [
      "Læs e-mailen, og skriv et svar til Yusuf.",
      "Du skal svare på alle Yusufs spørgsmål.",
      "Du skal skrive minimum 70 ord.",
    ],
    difficulty: "medium",
    content: {
      kind: "writing",
      situation: "Du har fået en mail fra din tidligere klassekammerat, Yusuf.",
      task: "Læs e-mailen, og skriv et svar til Yusuf. Du skal svare på alle Yusufs spørgsmål. Du skal skrive minimum 70 ord.",
      minWords: 70,
      incomingEmail: {
        from: "Yusuf",
        subject: "Nyt arbejde",
        body: "Hej\n\nTillykke med det nye arbejde! Jeg søger selv job for tiden, så jeg er meget nysgerrig efter at høre, hvordan det går.\n\nMange hilsner\nYusuf",
        questions: [
          "Hvad laver du på dit nye arbejde?",
          "Hvornår møder du om morgenen?",
          "Hvordan er dine kolleger?",
          "Hvad er det sværeste ved jobbet?",
        ],
      },
      answerHeader: { to: "Yusuf", subject: "Nyt arbejde" },
      mustInclude: [
        "Hvad du laver på arbejdet",
        "Hvornår du møder",
        "Noget om dine kolleger",
        "Hvad der er svært, og hvorfor",
        "En hilsen i starten og i slutningen",
      ],
    },
  },

  {
    variantId: "w-besked-nabo",
    category: "WRITING",
    taskType: "writing_message",
    moduleId: 2,
    topic: "Hverdagsliv",
    title: "Skriv en besked til din nabo",
    instruction: [
      "Læs situationen, og skriv en kort besked.",
      "Du skal have alle fire punkter med.",
      "Du skal skrive minimum 50 ord.",
    ],
    difficulty: "easy",
    content: {
      kind: "writing",
      situation:
        "Du skal rejse i en uge. Din nabo, Bente, har sagt ja til at hjælpe dig, mens du er væk. Du lægger en besked i hendes postkasse.",
      task: "Skriv en kort besked til Bente. Du skal skrive minimum 50 ord.",
      minWords: 50,
      answerHeader: { to: "Bente" },
      mustInclude: [
        "Sig hvornår du rejser, og hvornår du kommer hjem",
        "Skriv hvad hun skal hjælpe med (fx vande blomster eller tømme postkassen)",
        "Fortæl hvor nøglen er",
        "Skriv hvordan hun kan kontakte dig",
        "Sig tak",
      ],
    },
  },

  {
    variantId: "w-tekst-by",
    category: "WRITING",
    taskType: "writing_short_text",
    moduleId: 2,
    topic: "Hverdagsliv",
    title: "Skriv en kort tekst om din by",
    instruction: [
      "Læs opgaven, og skriv en kort tekst.",
      "Du skal have alle punkterne med.",
      "Du skal skrive minimum 70 ord.",
    ],
    difficulty: "medium",
    content: {
      kind: "writing",
      situation:
        "Din sprogskole laver en lille bog, hvor kursisterne fortæller om det sted, de bor. Din lærer har bedt dig skrive en tekst til bogen.",
      task: "Skriv en tekst om den by eller det kvarter, hvor du bor. Du skal skrive minimum 70 ord.",
      minWords: 70,
      mustInclude: [
        "Hvor du bor, og hvor længe du har boet der",
        "Hvad man kan lave i byen eller kvarteret",
        "Hvad du bedst kan lide ved stedet",
        "Noget du gerne vil ændre",
        "Mindst én sætning i datid",
      ],
    },
  },
];
