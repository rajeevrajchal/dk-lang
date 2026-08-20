import type { ExerciseVariant } from "./types";

// Læsning, Opgave 3 — write the missing words, each word once, four left over.
//
// Copied from the real modultest: a worked example on the first line, a word
// bank underneath, every word usable only once, and four words that are never
// needed. The "once only" rule is doing real work — it means a learner who has
// already spent 'fordi' must find another way to read a later gap.
//
// The bank is mostly function words (conjunctions, adverbs, modals), which is
// what the real test uses, because those are what carry sentence logic at this
// level. Blanks are never sentence-initial, so no gap can be solved just by
// noticing a capital letter.
//
// Shortened to 7 blanks (the full test runs longer).

const INSTRUCTION = (title: string) => [
  `Læs teksten ${title}.`,
  "Skriv de ord, der mangler.",
  "Du skal kun bruge hvert ord én gang.",
  "Der er fire ord, du ikke skal bruge. Se eksemplet i første linje.",
];

export const READING_TASK3_VARIANTS: ExerciseVariant[] = [
  // ---------------------------------------------------------------------
  {
    variantId: "r3-cykler",
    category: "READING",
    taskType: "reading_task_3_missing_words",
    moduleId: 2,
    topic: "Transport",
    title: "Danskerne og cyklen",
    instruction: INSTRUCTION("Danskerne og cyklen"),
    difficulty: "medium",
    content: {
      kind: "reading_task_3_missing_words",
      textTitle: "Danskerne og cyklen",
      exampleWord: "elsker",
      exampleSentence: "Danskerne ___ deres cykler.",
      textSegments: [
        "I København cykler næsten halvdelen af alle mennesker på arbejde eller i skole hver dag. Mange gør det, ",
        " det er hurtigere end at køre i bil. Man skal nemlig ikke lede efter en parkeringsplads, ",
        " man sparer også penge. Om vinteren er det ",
        " koldt, ",
        " de fleste bliver ved. Kommunen rydder cykelstierne for sne, ",
        " det har sneet om natten. Mange familier har en ladcykel, hvor to børn ",
        " sidde foran. Så kan forældrene aflevere dem i børnehaven på vej på arbejde. En elcykel koster mange penge, men ",
        " er de blevet billigere, og flere og flere køber en.",
      ],
      answers: ["fordi", "og", "meget", "men", "når", "kan", "nu"],
      wordBank: [
        "fordi",
        "vil",
        "og",
        "de",
        "meget",
        "elsker",
        "men",
        "mange",
        "når",
        "altid",
        "kan",
        "nu",
      ],
      rationales: [
        "'fordi' indleder en grund: hvorfor gør mange det? Fordi det er hurtigere.",
        "'og' lægger endnu en fordel til den første. Ordet 'også' i sætningen viser, at der bliver lagt noget til.",
        "'meget' forstærker 'koldt'. Det er det eneste ord i banken, der kan stå foran et adjektiv på den måde.",
        "'men' viser modsætning: det er koldt, og alligevel bliver de fleste ved.",
        "'når' bruges om noget, der sker hver gang. Kommunen rydder stierne hver gang, det har sneet.",
        "'kan' er et modalverbum og udtrykker, at der er plads til to børn. 'vil' ville handle om, hvad børnene ønsker.",
        "'nu' sætter tiden: før var elcykler dyre, nu er de blevet billigere.",
      ],
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r3-mad",
    category: "READING",
    taskType: "reading_task_3_missing_words",
    moduleId: 2,
    topic: "Mad og hverdag",
    title: "Aftensmad i en travl hverdag",
    instruction: INSTRUCTION("Aftensmad i en travl hverdag"),
    difficulty: "medium",
    content: {
      kind: "reading_task_3_missing_words",
      textTitle: "Aftensmad i en travl hverdag",
      exampleWord: "spiser",
      exampleSentence: "De fleste danske familier ___ aftensmad mellem klokken 17 og 19.",
      textSegments: [
        "Mange familier har travlt om eftermiddagen. Børnene kommer hjem fra skole, ",
        " forældrene kommer sent fra arbejde. Derfor laver mange en ret, ",
        " kun tager tyve minutter. Nogle planlægger hele ugens mad om søndagen, ",
        " det sparer tid senere. Andre køber ind hver dag, ",
        " de ikke ved, hvad de har lyst til. Om fredagen er der ",
        " mere tid, og så laver familien tit mad sammen. Børnene ",
        " gerne hjælpe med at skære grøntsager. Færdigretter fra supermarkedet er nemme, ",
        " de er dyrere end at lave maden selv.",
      ],
      answers: ["og", "der", "fordi", "hvis", "lidt", "vil", "men"],
      wordBank: [
        "og",
        "spiser",
        "der",
        "meget",
        "fordi",
        "aldrig",
        "hvis",
        "som",
        "lidt",
        "vil",
        "men",
        "skal",
      ],
      rationales: [
        "'og' forbinder to ting, der begge sker om eftermiddagen.",
        "'der' er relativpronomen og henviser tilbage til 'en ret'. En ret, der tager tyve minutter.",
        "'fordi' giver grunden til at planlægge om søndagen: det sparer tid.",
        "'hvis' indleder en betingelse: man køber ind hver dag, hvis man ikke ved, hvad man vil have.",
        "'lidt' står foran komparativen 'mere' og gør den svagere: lidt mere tid.",
        "'vil' med 'gerne' betyder, at børnene har lyst til at hjælpe.",
        "'men' viser modsætning: færdigretter er nemme, men de koster mere.",
      ],
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r3-frivillig",
    category: "READING",
    taskType: "reading_task_3_missing_words",
    moduleId: 2,
    topic: "Medborgerskab",
    title: "At arbejde frivilligt",
    instruction: INSTRUCTION("At arbejde frivilligt"),
    difficulty: "medium",
    content: {
      kind: "reading_task_3_missing_words",
      textTitle: "At arbejde frivilligt",
      exampleWord: "mange",
      exampleSentence: "I Danmark arbejder ___ mennesker frivilligt.",
      textSegments: [
        "Frivilligt arbejde betyder, at man arbejder uden at få løn. Nogle hjælper i en sportsklub, ",
        " andre besøger ældre, der bor alene. Man bestemmer selv, hvor mange timer man ",
        " bruge. De fleste bruger to eller tre timer om ugen. Man behøver ikke have en særlig uddannelse, ",
        " man skal møde op, når man har lovet det. Foreningerne siger, at det er vigtigt, ",
        " de kan regne med de frivillige. Mange begynder, ",
        " de er gået på pension og har mere tid. Andre er unge og gør det, ",
        " de gerne vil møde nye mennesker. Næsten alle siger bagefter, at de fik ",
        " mere igen, end de havde troet.",
      ],
      answers: ["og", "vil", "men", "at", "når", "fordi", "meget"],
      wordBank: [
        "og",
        "hvis",
        "vil",
        "mange",
        "men",
        "aldrig",
        "at",
        "som",
        "når",
        "fordi",
        "meget",
        "der",
      ],
      rationales: [
        "'og' forbinder to eksempler på frivilligt arbejde.",
        "'vil' er modalverbum: man bestemmer selv, hvor mange timer man ønsker at bruge.",
        "'men' viser modsætning: man behøver ingen uddannelse, men man skal møde op.",
        "'at' indleder en ledsætning efter 'det er vigtigt'.",
        "'når' bruges om et tidspunkt: mange begynder på det tidspunkt, hvor de går på pension.",
        "'fordi' giver grunden til, at de unge gør det.",
        "'meget' forstærker komparativen 'mere': meget mere igen.",
      ],
    },
  },
];
