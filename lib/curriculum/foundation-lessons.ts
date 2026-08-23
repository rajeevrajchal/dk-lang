import type { TheoryLesson } from "@/types";

// The foundation lessons — written for someone who has never studied Danish
// and may never have studied grammar in any language.
//
// The existing twelve theory lessons assume you already know what a verb, an
// adjective or a subordinate clause is. That is fine once you are a few
// chapters in, and useless on day one. These lessons come first and explain
// the words themselves before using them.
//
// Same TheoryLesson shape as the existing lessons, so they render in the same
// component and live at the same /theory/[slug] route. They just fill in the
// optional course fields (primer, learningObjectives, canDo, exercises) that
// the older lessons leave empty.

export const FOUNDATION_LESSONS: TheoryLesson[] = [
  // -------------------------------------------------------------------
  // Chapter 1 — what a sentence is made of
  // -------------------------------------------------------------------
  {
    slug: "what-is-a-sentence",
    title: "What a Danish sentence is made of",
    danishName: "Sætningens dele",
    tier: 1,
    constructCodes: [],
    primer:
      "Before any grammar rules, it helps to have names for the pieces of a sentence. There are only three you need to start: who does it, what they do, and what it happens to. Everything else in this course is built on those three.",
    learningObjectives: [
      "Name the three basic parts of a sentence: subject, verb, object",
      "Point at each of them in a simple Danish sentence",
      "Read a short Danish sentence and say who is doing what",
    ],
    canDo: "I can look at a simple Danish sentence and say which word is the doer and which word is the action.",
    summary:
      "Almost every Danish statement answers three questions in the same order: who? does what? to what? Learn to spot those three and Danish sentences stop being a wall of unfamiliar words.",
    sections: [
      {
        heading: "The doer — the subject",
        body: "The subject is the person or thing doing something. In English it is 'I', 'you', 'Peter', 'the bus'. In Danish it is the same idea, just different words. The subject usually comes first.",
        examples: [
          { danish: "Jeg", english: "I", note: "The word you will use most often." },
          { danish: "Du", english: "you (one person)" },
          { danish: "Han / Hun", english: "he / she" },
          { danish: "Peter", english: "Peter — a name works as a subject too" },
        ],
      },
      {
        heading: "The action — the verb",
        body: "A verb is a word for something you do, or something that happens. If you can put 'I ...' in front of it in English and it makes sense, it is a verb. This is the single most important word class in the course, because Danish grammar is mostly about where the verb goes and what shape it takes.",
        examples: [
          { danish: "arbejder", english: "work / works", note: "from 'at arbejde' — to work" },
          { danish: "bor", english: "live / lives", note: "from 'at bo' — to live somewhere" },
          { danish: "spiser", english: "eat / eats", note: "from 'at spise' — to eat" },
          { danish: "hedder", english: "am/is called", note: "from 'at hedde' — used for names" },
        ],
      },
      {
        heading: "Put the two together and you have a sentence",
        body: "A doer plus an action is already a complete Danish sentence. You do not need anything else.",
        examples: [
          { danish: "Jeg arbejder.", english: "I work.", note: "subject + verb. That is a whole sentence." },
          { danish: "Han spiser.", english: "He eats." },
          { danish: "Vi bor her.", english: "We live here." },
        ],
      },
      {
        heading: "The third part — what it happens to",
        body: "Often there is a third piece: the thing the action affects, or where it happens. It comes after the verb. Grammar books call it the object; you can just think of it as 'the rest'.",
        table: {
          headers: ["Who (subject)", "Does what (verb)", "The rest"],
          rows: [
            ["Jeg", "bor", "i Aarhus"],
            ["Han", "spiser", "morgenmad"],
            ["Maria", "arbejder", "på et hospital"],
            ["Vi", "taler", "dansk"],
          ],
        },
      },
      {
        heading: "Words worth knowing now",
        body: "You will meet these in almost every sentence in the next few chapters. Learn them as whole words — the grammar comes later.",
        table: {
          headers: ["Dansk", "English"],
          rows: [
            ["jeg", "I"],
            ["du", "you"],
            ["han / hun", "he / she"],
            ["vi", "we"],
            ["de", "they"],
            ["og", "and"],
            ["i", "in"],
            ["på", "on / at"],
            ["her", "here"],
          ],
        },
      },
    ],
    pitfalls: [
      "Trying to translate word for word from your own language. Danish word order has its own rules — you will learn them in Chapter 7.",
      "Thinking you need a long sentence to be correct. 'Jeg arbejder.' is complete and correct.",
    ],
    exercises: [
      {
        id: "s1-e1",
        kind: "recognition",
        instruction: "Which word is the verb — the action?",
        sentence: "Jeg bor i Aarhus",
        answerIndex: 1,
        explanation: "'bor' is the action (to live somewhere). 'Jeg' is the doer and 'i Aarhus' is where.",
      },
      {
        id: "s1-e2",
        kind: "recognition",
        instruction: "Which word is the subject — the person doing it?",
        sentence: "Maria arbejder på et hospital",
        answerIndex: 0,
        explanation: "'Maria' is the one doing the action. A name works as a subject just like 'jeg' or 'hun'.",
      },
      {
        id: "s1-e3",
        kind: "selection",
        instruction: "Choose the missing verb.",
        sentence: "Jeg ___ dansk.",
        options: ["taler", "og", "her"],
        answer: "taler",
        explanation: "'taler' means 'speak'. 'og' means 'and' and 'her' means 'here' — neither is an action.",
      },
      {
        id: "s1-e4",
        kind: "matching",
        instruction: "Match the Danish word with its meaning.",
        pairs: [
          { left: "jeg", right: "I" },
          { left: "han", right: "he" },
          { left: "vi", right: "we" },
          { left: "de", right: "they" },
        ],
      },
      {
        id: "s1-e5",
        kind: "ordering",
        instruction: "Put the words in order to make a sentence.",
        scrambled: ["i", "Jeg", "Aarhus", "bor"],
        answer: ["Jeg", "bor", "i", "Aarhus"],
        explanation: "Doer first (Jeg), then the action (bor), then the rest (i Aarhus).",
      },
      {
        id: "s1-e6",
        kind: "controlled_production",
        instruction: "Write 'I work' in Danish.",
        prompt: "I work.",
        acceptedAnswers: ["Jeg arbejder", "Jeg arbejder."],
        hint: "Doer + action. The verb for 'work' is 'arbejder'.",
        explanation: "Jeg arbejder. — subject then verb, and that is already a complete sentence.",
      },
      {
        id: "s1-e7",
        kind: "communication",
        instruction: "Say this out loud about yourself.",
        prompt: "Hvad hedder du, og hvor bor du?",
        demand: "factual",
        usefulPhrases: ["Jeg hedder ...", "Jeg bor i ..."],
        explanation: "Two sentences, each built the same way: doer, action, then the rest.",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Chapter 3 — pronouns
  // -------------------------------------------------------------------
  {
    slug: "pronouns",
    title: "Pronouns: jeg, du, han, hun",
    danishName: "Pronominer",
    tier: 1,
    constructCodes: [],
    primer:
      "A pronoun is a short word that stands in for a name, so you do not have to repeat it. Instead of 'Peter works, and Peter lives in Aarhus', you say 'Peter works, and HE lives in Aarhus'. 'He' is the pronoun.",
    learningObjectives: [
      "Use the Danish words for I, you, he, she, we, they",
      "Tell the difference between the doer form (jeg) and the object form (mig)",
      "Say who something belongs to using min, din, hans, hendes",
    ],
    canDo: "I can talk about myself and other people without repeating their names.",
    summary:
      "Danish pronouns come in three sets: the doer form, the object form, and the belonging form. They are short, common, and worth memorising early — you cannot say much without them.",
    sections: [
      {
        heading: "The doer form — who does it",
        body: "These go in front of the verb, in the subject slot from Chapter 1.",
        table: {
          headers: ["Dansk", "English", "Example"],
          rows: [
            ["jeg", "I", "Jeg arbejder."],
            ["du", "you (one person)", "Du arbejder."],
            ["han", "he", "Han arbejder."],
            ["hun", "she", "Hun arbejder."],
            ["den / det", "it", "Den er stor."],
            ["vi", "we", "Vi arbejder."],
            ["I", "you (several people)", "I arbejder."],
            ["de", "they", "De arbejder."],
          ],
        },
      },
      {
        heading: "The object form — who it happens to",
        body: "When the pronoun is on the receiving end of the action, it changes shape. English does this too: 'I' becomes 'me', 'he' becomes 'him'.",
        table: {
          headers: ["Doer", "Object", "English"],
          rows: [
            ["jeg", "mig", "I → me"],
            ["du", "dig", "you → you"],
            ["han", "ham", "he → him"],
            ["hun", "hende", "she → her"],
            ["vi", "os", "we → us"],
            ["de", "dem", "they → them"],
          ],
        },
        examples: [
          { danish: "Jeg kender hende.", english: "I know her.", note: "'hende', not 'hun', because she is on the receiving end." },
          { danish: "Hun kender mig.", english: "She knows me." },
        ],
      },
      {
        heading: "The belonging form — whose it is",
        body: "These say who something belongs to. 'min' and 'din' change with the noun's gender, which you meet properly in Chapter 2; the others never change.",
        table: {
          headers: ["Dansk", "English", "Example"],
          rows: [
            ["min / mit", "my", "min bil, mit hus"],
            ["din / dit", "your", "din bil, dit hus"],
            ["hans", "his", "hans bil"],
            ["hendes", "her", "hendes hus"],
            ["vores", "our", "vores bil"],
            ["deres", "their", "deres hus"],
          ],
        },
      },
    ],
    pitfalls: [
      "Using 'jeg' where the object form is needed: 'Hun kender jeg' should be 'Hun kender mig'.",
      "Capital 'I' means 'you' (plural), not the English 'I'. The Danish for 'I' is 'jeg', always lower case mid-sentence.",
      "Mixing up 'hans' (his) and 'hendes' (her) — they follow the owner's gender, not the object's.",
    ],
    exercises: [
      {
        id: "p-e1",
        kind: "selection",
        instruction: "Choose the right pronoun.",
        sentence: "___ bor i København.",
        options: ["Hun", "Hende", "Hendes"],
        answer: "Hun",
        explanation: "She is the one doing the living, so it is the doer form 'hun'.",
      },
      {
        id: "p-e2",
        kind: "selection",
        instruction: "Choose the right pronoun.",
        sentence: "Jeg kender ___.",
        options: ["han", "ham", "hans"],
        answer: "ham",
        explanation: "He is on the receiving end of 'kender', so it is the object form 'ham'.",
      },
      {
        id: "p-e3",
        kind: "matching",
        instruction: "Match the doer form with its object form.",
        pairs: [
          { left: "jeg", right: "mig" },
          { left: "du", right: "dig" },
          { left: "hun", right: "hende" },
          { left: "de", right: "dem" },
        ],
      },
      {
        id: "p-e4",
        kind: "ordering",
        instruction: "Put the words in order.",
        scrambled: ["kender", "Hun", "mig"],
        answer: ["Hun", "kender", "mig"],
        explanation: "Doer (Hun), action (kender), then who it happens to (mig).",
      },
      {
        id: "p-e5",
        kind: "controlled_production",
        instruction: "Write 'We live in Odense' in Danish.",
        prompt: "We live in Odense.",
        acceptedAnswers: ["Vi bor i Odense", "Vi bor i Odense."],
        hint: "'we' is 'vi'.",
      },
      {
        id: "p-e6",
        kind: "free_production",
        instruction: "Write two sentences about someone you know.",
        prompt: "Skriv to sætninger om en person, du kender. Brug 'han' eller 'hun'.",
        checklist: [
          "Both sentences start with han or hun",
          "Both have a verb",
          "At least one says where the person lives or works",
        ],
        modelAnswer: "Hun hedder Sara. Hun bor i Aalborg og arbejder på et kontor.",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Chapter 5 — questions
  // -------------------------------------------------------------------
  {
    slug: "questions",
    title: "Asking questions",
    danishName: "Spørgsmål",
    tier: 1,
    constructCodes: [],
    primer:
      "A question asks for information instead of giving it. In Danish there are only two kinds, and both are simpler than in English — there is no equivalent of 'do you...?' to worry about.",
    learningObjectives: [
      "Ask a yes/no question by swapping the first two words",
      "Use the Danish question words: hvad, hvor, hvem, hvornår, hvordan, hvorfor",
      "Answer a question with a full sentence",
    ],
    canDo: "I can ask someone where they live, what they do, and when something happens — and understand the answer.",
    summary:
      "Yes/no questions put the verb first. Open questions put a question word first and the verb straight after. That is the whole system.",
    sections: [
      {
        heading: "Yes/no questions: swap the first two words",
        body: "Take a statement and swap the doer and the verb. No extra words are added — this is much simpler than English, which needs 'do'.",
        examples: [
          { danish: "Du bor i Aarhus. → Bor du i Aarhus?", english: "You live in Aarhus. → Do you live in Aarhus?", note: "English adds 'do'. Danish just swaps." },
          { danish: "Han arbejder. → Arbejder han?", english: "He works. → Does he work?" },
          { danish: "Det er dyrt. → Er det dyrt?", english: "It is expensive. → Is it expensive?" },
        ],
      },
      {
        heading: "The question words",
        body: "For anything other than yes/no you start with a question word. Most begin with hv- , which is a useful thing to notice.",
        table: {
          headers: ["Dansk", "English", "Example"],
          rows: [
            ["hvad", "what", "Hvad laver du?"],
            ["hvor", "where", "Hvor bor du?"],
            ["hvem", "who", "Hvem er det?"],
            ["hvornår", "when", "Hvornår kommer du?"],
            ["hvordan", "how", "Hvordan går det?"],
            ["hvorfor", "why", "Hvorfor gør du det?"],
            ["hvor mange", "how many", "Hvor mange børn har du?"],
            ["hvor længe", "how long", "Hvor længe har du boet her?"],
          ],
        },
      },
      {
        heading: "The verb always comes straight after the question word",
        body: "This is the same rule you will meet again in Chapter 7: the verb is the second element. A question word counts as the first element.",
        examples: [
          { danish: "Hvor bor du?", english: "Where do you live?", note: "hvor (1) · bor (2) · du (3). Not 'Hvor du bor?'." },
          { danish: "Hvad laver du?", english: "What are you doing / what do you do?" },
          { danish: "Hvornår starter du?", english: "When do you start?" },
        ],
      },
      {
        heading: "Answering",
        body: "Answer with a full sentence when you can — it is what the modultest expects, and it is good practice.",
        examples: [
          { danish: "Hvor bor du? — Jeg bor i Odense.", english: "Where do you live? — I live in Odense." },
          { danish: "Arbejder du? — Ja, jeg arbejder på et hotel.", english: "Do you work? — Yes, I work at a hotel." },
        ],
      },
    ],
    pitfalls: [
      "Adding a word for 'do': 'Gør du bor i Aarhus?' is wrong. Just swap: 'Bor du i Aarhus?'",
      "Keeping statement order after a question word: 'Hvor du bor?' should be 'Hvor bor du?'",
      "Answering only 'Ja' or 'Nej'. Add the sentence — 'Ja, jeg bor i Aarhus.'",
    ],
    exercises: [
      {
        id: "q-e1",
        kind: "recognition",
        instruction: "Which word makes this a question?",
        sentence: "Hvor arbejder du",
        answerIndex: 0,
        explanation: "'Hvor' means 'where'. It is the question word, and the verb follows straight after it.",
      },
      {
        id: "q-e2",
        kind: "selection",
        instruction: "Choose the right question word.",
        sentence: "___ hedder du?",
        options: ["Hvad", "Hvor", "Hvornår"],
        answer: "Hvad",
        explanation: "You are asking for a name, so it is 'hvad' (what). 'Hvad hedder du?' is how you ask someone's name.",
      },
      {
        id: "q-e3",
        kind: "selection",
        instruction: "Turn this into a yes/no question: 'Du arbejder i Aarhus.'",
        sentence: "___ du i Aarhus?",
        options: ["Arbejder", "Gør", "Hvor"],
        answer: "Arbejder",
        explanation: "Swap the doer and the verb. Danish does not add a word for 'do'.",
      },
      {
        id: "q-e4",
        kind: "matching",
        instruction: "Match the question word with what it asks for.",
        pairs: [
          { left: "hvor", right: "a place" },
          { left: "hvornår", right: "a time" },
          { left: "hvem", right: "a person" },
          { left: "hvorfor", right: "a reason" },
        ],
      },
      {
        id: "q-e5",
        kind: "ordering",
        instruction: "Put the words in order to make a question.",
        scrambled: ["du", "Hvor", "bor"],
        answer: ["Hvor", "bor", "du"],
        explanation: "Question word first, then the verb, then the doer.",
      },
      {
        id: "q-e6",
        kind: "controlled_production",
        instruction: "Ask someone what they are doing.",
        prompt: "What are you doing?",
        acceptedAnswers: ["Hvad laver du", "Hvad laver du?"],
        hint: "'laver' is the verb for 'do/make'.",
      },
      {
        id: "q-e7",
        kind: "communication",
        instruction: "Ask three questions out loud, then answer them about yourself.",
        prompt: "Stil tre spørgsmål med hvor, hvad og hvornår. Svar selv på dem.",
        demand: "factual",
        usefulPhrases: ["Hvor bor du?", "Hvad laver du?", "Hvornår står du op?"],
      },
    ],
  },

  // -------------------------------------------------------------------
  // Chapter 6 — negation
  // -------------------------------------------------------------------
  {
    slug: "negation",
    title: "Saying no: ikke",
    danishName: "Negation",
    tier: 1,
    constructCodes: [],
    primer:
      "Negation means saying that something is NOT the case. In English you usually need two words — 'do not', 'does not'. Danish needs only one: ikke.",
    learningObjectives: [
      "Make a sentence negative with 'ikke'",
      "Put 'ikke' in the right place — after the verb in a normal sentence",
      "Use 'aldrig', 'ingen' and 'ingenting'",
    ],
    canDo: "I can say that something is not true, and put 'ikke' in the right place.",
    summary:
      "Add 'ikke' after the verb and the sentence becomes negative. The position matters, and it is the same position you will need again when you meet subordinate clauses later.",
    sections: [
      {
        heading: "ikke goes after the verb",
        body: "In a normal statement, 'ikke' comes straight after the verb. Nothing else changes.",
        examples: [
          { danish: "Jeg arbejder. → Jeg arbejder ikke.", english: "I work. → I do not work.", note: "English needs 'do not'. Danish just adds 'ikke'." },
          { danish: "Hun bor i Aarhus. → Hun bor ikke i Aarhus.", english: "She lives in Aarhus. → She does not live in Aarhus." },
          { danish: "Det er dyrt. → Det er ikke dyrt.", english: "It is expensive. → It is not expensive." },
        ],
      },
      {
        heading: "In a question it goes after the doer",
        body: "The verb has moved to the front, so 'ikke' follows the subject instead.",
        examples: [
          { danish: "Arbejder du ikke i dag?", english: "Aren't you working today?" },
          { danish: "Bor hun ikke i Odense?", english: "Doesn't she live in Odense?" },
        ],
      },
      {
        heading: "Other negative words",
        body: "These replace 'ikke' rather than joining it — Danish does not stack negatives the way some languages do.",
        table: {
          headers: ["Dansk", "English", "Example"],
          rows: [
            ["aldrig", "never", "Jeg ryger aldrig."],
            ["ingen", "no / none (people, en-words)", "Der er ingen her."],
            ["intet / ingenting", "nothing", "Jeg siger ingenting."],
            ["ikke noget", "not anything", "Jeg har ikke noget."],
          ],
        },
      },
      {
        heading: "Why the position matters later",
        body: "Remember where 'ikke' sits in a normal sentence — after the verb. In Chapter 13 you meet clauses where it moves in FRONT of the verb, and that shift is how you recognise those clauses at a glance. Learning the normal position now makes that chapter easy.",
        examples: [
          { danish: "Han arbejder ikke i dag.", english: "He isn't working today.", note: "Normal sentence: verb, then ikke." },
          { danish: "... fordi han ikke arbejder i dag.", english: "... because he isn't working today.", note: "You will learn this one later. Notice ikke moved." },
        ],
      },
    ],
    pitfalls: [
      "Putting 'ikke' before the verb in a normal sentence: 'Jeg ikke arbejder' should be 'Jeg arbejder ikke'.",
      "Translating 'do not' with two words. There is no Danish word for the 'do' part.",
      "Stacking negatives: 'Jeg har ikke ingenting' is wrong. Pick one.",
    ],
    exercises: [
      {
        id: "n-e1",
        kind: "recognition",
        instruction: "Which word makes this sentence negative?",
        sentence: "Jeg arbejder ikke i dag",
        answerIndex: 2,
        explanation: "'ikke' is the negative word, and it sits right after the verb 'arbejder'.",
      },
      {
        id: "n-e2",
        kind: "selection",
        instruction: "Where does 'ikke' go?",
        sentence: "Hun ___ i København.",
        options: ["bor ikke", "ikke bor", "bor ikke ikke"],
        answer: "bor ikke",
        explanation: "In a normal statement 'ikke' comes after the verb: 'Hun bor ikke i København.'",
      },
      {
        id: "n-e3",
        kind: "ordering",
        instruction: "Put the words in order.",
        scrambled: ["ikke", "Jeg", "dansk", "taler"],
        answer: ["Jeg", "taler", "ikke", "dansk"],
        explanation: "Doer, verb, ikke, then the rest.",
      },
      {
        id: "n-e4",
        kind: "controlled_production",
        instruction: "Make this negative: 'Jeg bor i Aarhus.'",
        prompt: "Jeg bor i Aarhus.",
        acceptedAnswers: ["Jeg bor ikke i Aarhus", "Jeg bor ikke i Aarhus."],
        hint: "Add one word, straight after the verb.",
      },
      {
        id: "n-e5",
        kind: "free_production",
        instruction: "Write two true sentences about things you do not do.",
        prompt: "Skriv to sætninger om noget, du ikke gør. Brug 'ikke' eller 'aldrig'.",
        checklist: [
          "Each sentence has a doer and a verb",
          "'ikke' comes after the verb",
          "At least one sentence uses 'aldrig'",
        ],
        modelAnswer: "Jeg spiser ikke kød. Jeg drikker aldrig kaffe om aftenen.",
      },
    ],
  },
];
