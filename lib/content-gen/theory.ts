// Grammar theory lessons — the "teach" half of a module, sitting in front of
// practice. Each lesson maps to one or more construct codes from
// lib/content-gen/constructs.ts, so a weak construct reported by the adaptive
// engine can be linked straight back to the rule that explains it.
//
// Lesson *content* is written in English on purpose (like a Danish grammar
// textbook written for English speakers) with Danish terms and examples
// alongside — the learner needs the explanation in a language they already
// read fluently. Only the surrounding UI chrome is localized. This mirrors
// how the reading passages themselves stay Danish: content language and
// interface language are two different decisions.
//
// A few lessons (future tense, word order, noun gender, adjective agreement)
// have no construct code yet — they're not separately *tested* by the Modul 2
// item bank, but you can't read the passages without them, so they're taught.
// Those carry `constructCodes: []`.

import type { LessonKind, TheoryLesson } from "@/types";

/** A lesson's kind, defaulting the way an unlabelled lesson is treated. */
export const lessonKind = (lesson: TheoryLesson): LessonKind => {
  return lesson.kind ?? "grammar";
};

export const THEORY_LESSONS: TheoryLesson[] = [
  // -------------------------------------------------------------------
  // TIER 1
  // -------------------------------------------------------------------
  {
    slug: "word-order",
    title: "Word order: the verb comes second",
    danishName: "Ordstilling (V2)",
    tier: 1,
    constructCodes: [],
    summary:
      "Danish is a V2 language: in a main clause the finite verb is always the second element. Everything else moves around it. Get this one rule and most Danish sentences stop looking scrambled.",
    sections: [
      {
        heading: "The basic pattern",
        body: "A neutral main clause is Subject – Verb – Object. The verb sits in position 2, counting whole phrases (not words) as one element.",
        examples: [
          {
            danish: "Peter arbejder på et hospital.",
            english: "Peter works at a hospital.",
            note: "1: Peter · 2: arbejder · then the rest.",
          },
          {
            danish: "Maria går på sprogskole tre gange om ugen.",
            english: "Maria goes to language school three times a week.",
          },
        ],
      },
      {
        heading: "When something else comes first, the subject moves behind the verb",
        body: "If you start the sentence with a time, place, or adverbial, that phrase takes position 1 — so the subject gets pushed to position 3 to keep the verb in position 2. This is called inversion, and it is not optional.",
        examples: [
          {
            danish: "Om dagen hjælper han patienterne.",
            english: "During the day he helps the patients.",
            note: "'Om dagen' is position 1, so it is 'hjælper han', not 'han hjælper'.",
          },
          {
            danish: "Klokken tolv holder Peter pause.",
            english: "At twelve o'clock Peter takes a break.",
          },
          {
            danish: "Derfor bliver mange vagter dækket af vikarer.",
            english: "Therefore many shifts are covered by temps.",
            note: "Connectors like 'derfor' and 'dog' occupy position 1 and trigger the same inversion.",
          },
        ],
      },
      {
        heading: "Counting elements",
        body: "Position 1 is one whole phrase, however long. 'Sidste år', 'om morgenen', 'på hospitalet i Odense' each count as a single element.",
        table: {
          headers: ["1", "2 (verb)", "3", "rest"],
          rows: [
            ["Peter", "arbejder", "—", "på et hospital"],
            ["Om dagen", "hjælper", "han", "patienterne"],
            ["Sidste år", "skiftede", "Peter", "job"],
          ],
        },
      },
    ],
    pitfalls: [
      "Writing 'Om dagen han hjælper...' — after a fronted phrase the verb must come before the subject: 'Om dagen hjælper han...'.",
      "Forgetting that 'derfor' and 'dog' at the start of a clause also force inversion.",
    ],
  },
  {
    slug: "present-tense",
    title: "Present tense",
    danishName: "Nutid (præsens)",
    tier: 1,
    constructCodes: ["present-tense"],
    summary:
      "The easiest tense in Danish: one form for every person. No -s for he/she, no separate continuous form. 'Jeg arbejder', 'han arbejder', 'de arbejder' — all identical.",
    sections: [
      {
        heading: "How to form it",
        body: "Take the infinitive (the 'at ...' form), drop the 'at', and add -r. If the infinitive already ends in -e, you just add -r.",
        table: {
          headers: ["Infinitive", "Present", "English"],
          rows: [
            ["at arbejde", "arbejder", "work(s)"],
            ["at spise", "spiser", "eat(s)"],
            ["at bo", "bor", "live(s)"],
            ["at gå", "går", "go(es)"],
            ["at være", "er", "am / is / are (irregular)"],
            ["at have", "har", "have / has (irregular)"],
          ],
        },
      },
      {
        heading: "One form, every person",
        body: "Unlike English, the verb never changes with the subject. This is genuinely one of the easiest parts of Danish.",
        examples: [
          {
            danish: "Jeg arbejder. Du arbejder. Han arbejder. Vi arbejder. De arbejder.",
            english: "I work. You work. He works. We work. They work.",
            note: "English changes 'work' → 'works'. Danish never does.",
          },
        ],
      },
      {
        heading: "Present tense also covers 'is doing' and near future",
        body: "Danish has no separate continuous tense. 'Han spiser' means both 'he eats' and 'he is eating'. With a time expression it can also mean the future.",
        examples: [
          {
            danish: "Han spiser frokost i kantinen.",
            english: "He is eating lunch in the canteen.",
          },
          {
            danish: "Jeg rejser i morgen.",
            english: "I'm travelling tomorrow.",
            note: "Present form, future meaning — the time word does the work.",
          },
        ],
      },
    ],
    pitfalls: [
      "Inventing a 'he/she' form like 'han arbejders' — there is no such thing.",
      "Trying to build a continuous with 'er' ('han er arbejder') — that means 'he is a worker', a completely different sentence.",
    ],
  },
  {
    slug: "nouns-gender-and-definite-forms",
    title: "Nouns: en/et, and the attached 'the'",
    danishName: "Substantiver: køn og bestemt form",
    tier: 1,
    constructCodes: [],
    summary:
      "Every Danish noun is either an 'en-word' (common gender) or an 'et-word' (neuter). And 'the' is not a separate word — it's a suffix glued to the end of the noun.",
    sections: [
      {
        heading: "Two genders",
        body: "About 75% of nouns are en-words. There's no reliable rule, so learn each noun with its article: not 'hospital' but 'et hospital'.",
        examples: [
          { danish: "en lejlighed, en skole, en bus, en læge", english: "an apartment, a school, a bus, a doctor" },
          { danish: "et hospital, et bord, et år, et samfund", english: "a hospital, a table, a year, a society" },
        ],
      },
      {
        heading: "'The' is a suffix, not a word",
        body: "To make a noun definite, attach -en (en-words) or -et (et-words) to the end. This is the single biggest visual difference from English.",
        table: {
          headers: ["Indefinite", "Definite", "English"],
          rows: [
            ["en kantine", "kantinen", "a canteen → the canteen"],
            ["en klasse", "klassen", "a class → the class"],
            ["et køkken", "køkkenet", "a kitchen → the kitchen"],
            ["et hospital", "hospitalet", "a hospital → the hospital"],
          ],
        },
      },
      {
        heading: "Plurals, and the definite plural",
        body: "Plurals usually add -er, -e, or nothing. The definite plural then adds -ne. This is why you see long forms like 'patienterne' and 'lægerne' in reading texts.",
        table: {
          headers: ["Singular", "Plural", "Definite plural", "English"],
          rows: [
            ["patient", "patienter", "patienterne", "patient → patients → the patients"],
            ["læge", "læger", "lægerne", "doctor → doctors → the doctors"],
            ["elev", "elever", "eleverne", "student → students → the students"],
            ["år", "år", "årene", "year → years → the years (no change in plural)"],
            ["barn", "børn", "børnene", "child → children → the children (irregular)"],
          ],
        },
      },
      {
        heading: "The exception: adjective in front",
        body: "When an adjective comes before the noun, the definite ending is dropped and a separate word (den/det/de) appears instead.",
        examples: [
          {
            danish: "lejligheden → den nye lejlighed",
            english: "the apartment → the new apartment",
            note: "Not 'den nye lejligheden'. Only one 'the' per phrase.",
          },
          { danish: "køkkenet → det lille køkken", english: "the kitchen → the small kitchen" },
        ],
      },
    ],
    pitfalls: [
      "Doubling the definite: 'den nye lejligheden'. Once you use den/det/de, drop the suffix.",
      "Guessing the gender. Always learn the noun together with en/et.",
    ],
  },
  {
    slug: "coordination",
    title: "Joining clauses: og, men, eller",
    danishName: "Sideordning (og/men/eller)",
    tier: 1,
    constructCodes: ["coordination:og-men-eller"],
    summary:
      "These three link two equal main clauses. Crucially, they do NOT change word order — unlike the subordinating conjunctions you meet in Tier 2.",
    sections: [
      {
        heading: "Which one to use",
        body: "Pick by the relationship between the two halves: addition, contrast, or alternative.",
        table: {
          headers: ["Word", "Meaning", "Use it when"],
          rows: [
            ["og", "and", "both parts are simply true together"],
            ["men", "but", "the second part contrasts with the first"],
            ["eller", "or", "the parts are alternatives"],
          ],
        },
      },
      {
        heading: "Word order stays normal",
        body: "After og/men/eller the next clause starts fresh with subject then verb. Nothing inverts, nothing moves.",
        examples: [
          {
            danish: "Han hjælper patienterne, og han taler med lægerne.",
            english: "He helps the patients, and he talks to the doctors.",
          },
          {
            danish: "Det er hårdt, men det er også spændende.",
            english: "It's hard, but it's also exciting.",
            note: "Contrast between 'hårdt' and 'spændende' — that's what makes it 'men' and not 'og'.",
          },
          {
            danish: "Weekenden bruger familien i parken eller hjemme.",
            english: "The family spends the weekend in the park or at home.",
          },
        ],
      },
    ],
    pitfalls: [
      "Choosing 'og' where the two halves clearly contrast — gap-fill questions test exactly this. If you can put 'but' in the English, use 'men'.",
      "Changing the word order after 'men' as if it were a subordinating conjunction. It isn't.",
    ],
  },

  // -------------------------------------------------------------------
  // TIER 2
  // -------------------------------------------------------------------
  {
    slug: "past-tense",
    title: "Past tense",
    danishName: "Datid (præteritum)",
    tier: 2,
    constructCodes: ["past-tense"],
    summary:
      "Danish has two regular past-tense groups (-ede and -te) plus a set of common irregulars. Like the present, there is still only one form for all persons.",
    sections: [
      {
        heading: "The two regular groups",
        body: "Group 1 adds -ede, group 2 adds -te. There's no rule that predicts which group a verb belongs to — it has to be learned per verb, but group 1 is the larger and more 'default' one.",
        table: {
          headers: ["Infinitive", "Past (-ede)", "English"],
          rows: [
            ["at arbejde", "arbejdede", "worked"],
            ["at skifte", "skiftede", "changed"],
            ["at flytte", "flyttede", "moved"],
            ["at lave", "lavede", "made / cooked"],
            ["at bo", "boede", "lived"],
          ],
        },
      },
      {
        heading: "Group 2: -te",
        body: "A smaller but very frequent group.",
        table: {
          headers: ["Infinitive", "Past (-te)", "English"],
          rows: [
            ["at søge", "søgte", "applied / sought"],
            ["at spise", "spiste", "ate"],
            ["at læse", "læste", "read"],
            ["at høre", "hørte", "heard"],
          ],
        },
      },
      {
        heading: "Irregulars worth memorising now",
        body: "These appear constantly in reading texts, so they're worth knowing cold rather than deriving.",
        table: {
          headers: ["Infinitive", "Past", "English"],
          rows: [
            ["at være", "var", "was / were"],
            ["at have", "havde", "had"],
            ["at få", "fik", "got"],
            ["at blive", "blev", "became"],
            ["at gå", "gik", "went"],
            ["at stå", "stod", "stood"],
            ["at tage", "tog", "took"],
            ["at sige", "sagde", "said"],
          ],
        },
      },
      {
        heading: "Past vs. present perfect",
        body: "Use the simple past for a finished event at a stated time. Use 'har + past participle' when the time isn't specified or the result still matters.",
        examples: [
          {
            danish: "De flyttede sidste sommer.",
            english: "They moved last summer.",
            note: "Specific past time → simple past.",
          },
          {
            danish: "Ledelsen har besluttet at ansætte flere.",
            english: "Management has decided to hire more.",
            note: "No time stated, decision still stands → har + participle.",
          },
        ],
      },
    ],
    pitfalls: [
      "Mixing the groups: 'arbejdte' or 'søgede' — check which group the verb belongs to.",
      "Adding a person ending, e.g. 'han arbejdedes'. Still one form for everybody.",
    ],
  },
  {
    slug: "future-tense",
    title: "Talking about the future",
    danishName: "Fremtid",
    tier: 2,
    constructCodes: [],
    summary:
      "Danish has no dedicated future tense. You express the future in three ways: plain present tense with a time word, 'skal' for plans and arrangements, or 'vil' for intentions and predictions.",
    sections: [
      {
        heading: "1. Present tense + a time expression (most common)",
        body: "This is the everyday default. The time word carries the future meaning, so the verb stays in the present.",
        examples: [
          { danish: "Jeg rejser til Danmark næste år.", english: "I'm travelling to Denmark next year." },
          { danish: "Møblerne kommer i næste uge.", english: "The furniture is coming next week." },
        ],
      },
      {
        heading: "2. 'skal' — a plan, an arrangement, or an obligation",
        body: "Use 'skal + infinitive' when the future event is already scheduled or decided, or when someone is obliged to do it. This is the closest Danish gets to 'going to'.",
        examples: [
          {
            danish: "Hun skal snart til en ny test.",
            english: "She has a new test coming up soon.",
            note: "Arranged event — 'skal' is the natural choice.",
          },
          {
            danish: "Nye borgere skal lære om det danske samfund.",
            english: "New citizens must learn about Danish society.",
            note: "Same word, obligation reading — context decides.",
          },
        ],
      },
      {
        heading: "3. 'vil' — intention, willingness, or prediction",
        body: "'vil + infinitive' expresses what someone wants or intends, or what the speaker predicts. Note that it leans much more towards 'want to' than English 'will' does.",
        examples: [
          {
            danish: "Han ville arbejde tættere på sit hjem.",
            english: "He wanted to work closer to home.",
            note: "Past form 'ville' — clearly 'wanted to', not 'would'.",
          },
          { danish: "Det vil tage lang tid.", english: "It will take a long time." },
        ],
      },
    ],
    pitfalls: [
      "Inventing a future with 'at være' + verb, on the model of English 'will be'. Danish doesn't build it that way.",
      "Reading every 'vil' as English 'will'. Most of the time it means 'wants to' — 'hun vil bestå' is 'she wants to pass'.",
    ],
  },
  {
    slug: "modal-verbs",
    title: "Modal verbs: kan, skal, vil, må, bør",
    danishName: "Modalverber",
    tier: 2,
    constructCodes: ["modal-verb"],
    summary:
      "Five high-frequency helper verbs. They take a bare infinitive after them — no 'at' — and their past forms show up constantly in reading texts.",
    sections: [
      {
        heading: "The five, and what they actually mean",
        body: "The mapping to English is not one-to-one, and that's where most mistakes come from.",
        table: {
          headers: ["Present", "Past", "Core meaning", "English"],
          rows: [
            ["kan", "kunne", "ability / possibility", "can, be able to"],
            ["skal", "skulle", "obligation / arrangement", "must, shall, is going to"],
            ["vil", "ville", "intention / wish", "want to, will"],
            ["må", "måtte", "permission (or necessity)", "may, be allowed to"],
            ["bør", "burde", "recommendation", "ought to, should"],
          ],
        },
      },
      {
        heading: "No 'at' after a modal",
        body: "The verb that follows is a bare infinitive. Compare with English, which also drops 'to' after modals.",
        examples: [
          {
            danish: "Maria skal øve sig hver dag.",
            english: "Maria has to practice every day.",
            note: "'øve', not 'at øve'.",
          },
          { danish: "Hun kan nå sit mål.", english: "She can reach her goal." },
          { danish: "De bør deltage i lokale valg.", english: "They ought to take part in local elections." },
        ],
      },
      {
        heading: "'må' and the 'gerne' trick",
        body: "'må' alone can read as either permission or necessity. Danes disambiguate with 'gerne': 'må gerne' is unambiguously permission.",
        examples: [
          {
            danish: "Man må gerne sige sin mening offentligt.",
            english: "You are (freely) allowed to express your opinion publicly.",
            note: "'gerne' makes it permission, not obligation.",
          },
          {
            danish: "Man må ikke ryge her.",
            english: "You must not smoke here.",
            note: "Negated 'må' is a prohibition.",
          },
        ],
      },
    ],
    pitfalls: [
      "Putting 'at' after the modal: 'skal at øve'. Wrong — bare infinitive.",
      "Translating 'vil' as 'will' by reflex. 'Hun vil bestå' = 'she wants to pass', not 'she will pass'.",
      "Reading 'skal' as only obligation. It's also the ordinary way to state a scheduled future event.",
    ],
  },
  {
    slug: "subordinate-clauses",
    title: "Subordinate clauses: fordi, når, at, hvis",
    danishName: "Ledsætninger",
    tier: 2,
    constructCodes: [
      "subordinate-clause:fordi",
      "subordinate-clause:naar",
      "subordinate-clause:at",
    ],
    summary:
      "A subordinate clause is a clause that can't stand alone. In Danish it has its own word order rule — and that rule is the single most tested piece of grammar at this level.",
    sections: [
      {
        heading: "The connectors and what they signal",
        body: "Each one tells you what relationship the clause has to the main clause. Gap-fill questions are almost always asking you to identify that relationship.",
        table: {
          headers: ["Word", "Signals", "English"],
          rows: [
            ["fordi", "a reason / cause", "because"],
            ["når", "a time, or a repeated situation", "when, whenever"],
            ["at", "reported content after say/think/hope", "that"],
            ["hvis", "a condition", "if"],
          ],
        },
      },
      {
        heading: "The word-order rule: adverbs move in front of the verb",
        body: "In a main clause, short adverbs like 'ikke', 'altid', 'aldrig', 'nu' come AFTER the verb. Inside a subordinate clause they come BEFORE it. This inversion is how you recognise a ledsætning at a glance.",
        examples: [
          {
            danish: "Han arbejder ikke i dag.",
            english: "He isn't working today.",
            note: "Main clause: verb 'arbejder', then 'ikke'.",
          },
          {
            danish: "...fordi han ikke arbejder i dag.",
            english: "...because he isn't working today.",
            note: "Subordinate clause: 'ikke' jumps in front of 'arbejder'.",
          },
        ],
      },
      {
        heading: "Subordinate clause first? Then the main clause inverts",
        body: "If the whole subordinate clause is placed first, it occupies position 1 — so by the V2 rule the main clause's verb must come before its subject.",
        examples: [
          {
            danish: "Selvom Maria synes, at grammatik er svær, øver hun sig hver dag.",
            english: "Even though Maria finds grammar hard, she practices every day.",
            note: "'øver hun', not 'hun øver' — the fronted clause forced inversion.",
          },
          {
            danish: "Når de spiser aftensmad, sidder de ved et stort bord.",
            english: "When they eat dinner, they sit at a big table.",
          },
        ],
      },
      {
        heading: "'når' vs 'da'",
        body: "Both can translate as 'when'. Use 'når' for repeated or future events, 'da' for a single completed event in the past.",
        examples: [
          { danish: "Når de laver mad, står de tæt.", english: "Whenever they cook, they stand close together." },
          { danish: "Da de flyttede, var børnene glade.", english: "When they moved (that one time), the children were happy." },
        ],
      },
    ],
    pitfalls: [
      "Keeping main-clause order inside the subordinate clause: 'fordi han arbejder ikke'. Should be 'fordi han ikke arbejder'.",
      "Forgetting to invert the main clause after a fronted subordinate clause.",
      "Confusing 'fordi' (reason) with 'derfor' (result) — they point in opposite directions. See the connectors lesson.",
    ],
  },
  {
    slug: "adjective-agreement",
    title: "Adjective endings",
    danishName: "Adjektivernes bøjning",
    tier: 2,
    constructCodes: [],
    summary:
      "Danish adjectives take three endings depending on what they describe: nothing, -t, or -e. Getting these right is quick marks in the writing test, and knowing them helps you parse reading texts.",
    sections: [
      {
        heading: "The three forms",
        body: "Base form with en-words, +t with et-words, +e in the plural and in all definite phrases.",
        table: {
          headers: ["Context", "Form", "Example"],
          rows: [
            ["en-word, indefinite", "base", "en stor lejlighed"],
            ["et-word, indefinite", "+t", "et stort bord"],
            ["plural", "+e", "store lejligheder"],
            ["definite (any gender)", "+e", "den store lejlighed / det store bord"],
          ],
        },
      },
      {
        heading: "It applies after 'er' too",
        body: "When the adjective comes after the verb, it still agrees with the subject.",
        examples: [
          { danish: "Peter er glad.", english: "Peter is happy.", note: "en-word subject → base form." },
          { danish: "Det er hårdt.", english: "It is hard.", note: "neuter 'det' → +t." },
          { danish: "Børnene var glade.", english: "The children were happy.", note: "plural → +e." },
        ],
      },
      {
        heading: "The -t form doubles as an adverb",
        body: "This is why you keep seeing words that look like neuter adjectives in adverb positions.",
        examples: [
          { danish: "Læreren taler langsomt.", english: "The teacher speaks slowly." },
          { danish: "Reglerne overholdes strengt.", english: "The rules are strictly observed." },
        ],
      },
    ],
    pitfalls: [
      "Forgetting -t with et-words: 'et stor bord' should be 'et stort bord'.",
      "Forgetting -e after den/det/de: 'den ny lejlighed' should be 'den nye lejlighed'.",
    ],
  },

  // -------------------------------------------------------------------
  // TIER 3
  // -------------------------------------------------------------------
  {
    slug: "passive-voice",
    title: "Passive voice",
    danishName: "Passiv",
    tier: 3,
    constructCodes: ["passive-voice"],
    summary:
      "Danish has two passives: the -s passive and 'blive' + past participle. Both mean the action happens TO the subject. Formal texts — rules, procedures, official notices — are full of them.",
    sections: [
      {
        heading: "Form 1: blive + past participle",
        body: "The everyday spoken passive, and the one used for a specific event. 'blive' conjugates for tense; the participle never changes.",
        examples: [
          {
            danish: "Patienterne bliver undersøgt af en læge.",
            english: "The patients are examined by a doctor.",
          },
          {
            danish: "Den nye lejlighed bliver malet af et malerfirma.",
            english: "The new apartment is being painted by a painting company.",
          },
          {
            danish: "Mange vagter blev dækket af vikarer.",
            english: "Many shifts were covered by temps.",
            note: "Past tense: 'blive' becomes 'blev', participle unchanged.",
          },
        ],
      },
      {
        heading: "Form 2: the -s passive",
        body: "Add -s to the verb. Preferred in written and formal Danish, and for general rules rather than one-off events.",
        examples: [
          {
            danish: "Reglerne overholdes strengt.",
            english: "The rules are strictly observed.",
            note: "A standing rule, so -s rather than 'bliver overholdt'.",
          },
          { danish: "Døren lukkes klokken seks.", english: "The door is closed at six." },
        ],
      },
      {
        heading: "'af' marks who does it",
        body: "The agent — the one actually performing the action — is introduced with 'af'. It's often left out entirely when it doesn't matter.",
        examples: [
          {
            danish: "Møblerne bliver kørt derhen af et flyttefirma.",
            english: "The furniture is being transported there by a moving company.",
            note: "'af et flyttefirma' answers 'by whom?'.",
          },
        ],
      },
    ],
    pitfalls: [
      "Using 'er' instead of 'bliver': 'lejligheden er malet' describes a finished state (it's already painted), while 'bliver malet' describes the ongoing action.",
      "Inflecting the participle for the subject. It stays fixed: 'de bliver undersøgt', not 'undersøgte'.",
    ],
  },
  {
    slug: "connectors",
    title: "Connectors: selvom, derfor, dog",
    danishName: "Konnektorer",
    tier: 3,
    constructCodes: ["connector:selvom", "connector:derfor", "connector:dog"],
    summary:
      "These three signal the logic between sentences: concession, result, and contrast. They behave differently from each other grammatically, which is exactly what gets tested.",
    sections: [
      {
        heading: "What each one does",
        body: "Read them as signposts. If you know what the signpost means, multiple-choice questions about 'why' become straightforward.",
        table: {
          headers: ["Word", "Signals", "English", "Grammar type"],
          rows: [
            ["selvom", "concession — true despite", "even though", "subordinating (starts a ledsætning)"],
            ["derfor", "result — therefore", "so, therefore", "adverb (triggers inversion)"],
            ["dog", "mild contrast", "however, still", "adverb"],
          ],
        },
      },
      {
        heading: "'selvom' starts a subordinate clause",
        body: "It follows all the ledsætning rules from the Tier 2 lesson — including moving 'ikke' in front of the verb, and forcing the main clause to invert when it comes first.",
        examples: [
          {
            danish: "Selvom kurserne er frivillige, deltager mange.",
            english: "Even though the courses are voluntary, many take part.",
            note: "'deltager mange' — inversion, because the selvom-clause is in position 1.",
          },
        ],
      },
      {
        heading: "'derfor' vs 'fordi' — opposite directions",
        body: "This is the most common confusion at Tier 3. 'fordi' introduces the cause; 'derfor' introduces the consequence. Same two facts, opposite order.",
        examples: [
          {
            danish: "Der er for få sygeplejersker, og derfor bliver vagter dækket af vikarer.",
            english: "There are too few nurses, and therefore shifts are covered by temps.",
            note: "Cause first, then 'derfor' + result.",
          },
          {
            danish: "Vagter bliver dækket af vikarer, fordi der er for få sygeplejersker.",
            english: "Shifts are covered by temps, because there are too few nurses.",
            note: "Same facts, reversed — 'fordi' introduces the cause.",
          },
        ],
      },
      {
        heading: "'dog' softens or pushes back",
        body: "Usually sits inside the clause rather than at the front, and signals 'even so'.",
        examples: [
          {
            danish: "Det bliver dyrere end forventet. De er dog glade for lejligheden.",
            english: "It's turning out more expensive than expected. They're happy with the apartment even so.",
          },
        ],
      },
    ],
    pitfalls: [
      "Swapping 'fordi' and 'derfor'. Test yourself: does the clause give the reason (fordi) or the consequence (derfor)?",
      "Treating 'derfor' as a conjunction and forgetting the inversion: 'derfor mange vagter bliver...' should be 'derfor bliver mange vagter...'.",
    ],
  },
  {
    slug: "multiple-subordinate-clauses",
    title: "Sentences with several clauses",
    danishName: "Flere ledsætninger",
    tier: 3,
    constructCodes: ["multiple-subordinate-clauses"],
    summary:
      "Tier 3 texts stack two or three subordinate clauses in one sentence. Nothing new is happening grammatically — you're applying the Tier 2 rules repeatedly. The skill is unpacking, not new theory.",
    sections: [
      {
        heading: "A reading strategy that works",
        body: "Find the main clause first: the one that could stand alone as a sentence. Then attach each subordinate clause to what it modifies. Read the connectors as brackets opening.",
        examples: [
          {
            danish:
              "Selvom Maria synes, at grammatik er svær, øver hun sig hver dag, fordi hun ved, at det hjælper hende.",
            english:
              "Even though Maria finds grammar hard, she practices every day, because she knows that it helps her.",
            note: "Main clause: 'øver hun sig hver dag'. Around it: a selvom-clause (with an at-clause inside), and a fordi-clause (with another at-clause inside).",
          },
        ],
      },
      {
        heading: "Clauses inside clauses",
        body: "An at-clause very often sits inside another subordinate clause, because verbs like 'synes', 'ved', 'siger', 'tror' all take one. Expect that nesting rather than being surprised by it.",
        examples: [
          {
            danish: "Kommunen tilbyder kurser, hvor man kan lære om rettigheder, fordi det er vigtigt, at alle forstår systemet.",
            english:
              "The municipality offers courses where you can learn about rights, because it's important that everyone understands the system.",
            note: "hvor-clause, then fordi-clause, with an at-clause nested in the fordi-clause.",
          },
        ],
      },
      {
        heading: "The comma tells you a clause boundary",
        body: "Danish puts a comma at subordinate-clause boundaries far more consistently than English. Treat every comma as a hint about where a clause starts or ends.",
      },
    ],
    pitfalls: [
      "Trying to translate left to right. Find the main clause first, then the modifiers.",
      "Losing track of which clause a 'det' or 'hun' refers back to — check the nearest matching noun.",
    ],
  },
];

export const THEORY_BY_SLUG = new Map(THEORY_LESSONS.map((l) => [l.slug, l]));

// Construct code -> the lesson that teaches it. Lets the Explain panel and
// the weak-construct recommendation both jump straight to the right rule.
export const THEORY_BY_CONSTRUCT = new Map<string, TheoryLesson>();
for (const lesson of THEORY_LESSONS) {
  for (const code of lesson.constructCodes) {
    THEORY_BY_CONSTRUCT.set(code, lesson);
  }
}

// Modul 2 spans tiers 1-3 (see lib/curriculum/modules.ts). A module shows the
// theory for the tiers it actually covers.
export const theoryForTiers = (tiers: number[]): TheoryLesson[] => {
  return THEORY_LESSONS.filter((l) => tiers.includes(l.tier));
};
