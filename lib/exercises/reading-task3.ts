import type { ExerciseVariant } from "@/types";

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
        "'fordi' introduces a reason: why do so many people do it? Because it is faster.",
        "'og' adds a second advantage to the first. The word 'også' later in the sentence is the clue that something is being added.",
        "'meget' intensifies the adjective 'koldt'. It is the only word in the bank that can stand in front of an adjective like this.",
        "'men' marks a contrast: it is cold, and yet most people carry on anyway.",
        "'når' is used for something that happens every time. The kommune clears the paths every time it has snowed - 'da' would mean one single occasion in the past.",
        "'kan' is a modal verb and states that there is room for two children. 'vil' would be about what the children want, which is not what the sentence is saying.",
        "'nu' sets the time: electric bikes used to be expensive, now they have got cheaper. The sentence is built on that before-and-now contrast.",
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
        "'og' joins two things that both happen in the afternoon.",
        "'der' is a relative pronoun pointing back to 'en ret': a dish that takes twenty minutes. 'som' would also work grammatically, but it is not in the bank.",
        "'fordi' gives the reason for planning on a Sunday: it saves time.",
        "'hvis' introduces a condition: you shop every day IF you do not know what you want.",
        "'lidt' stands in front of the comparative 'mere' and softens it: a little more time.",
        "'vil' together with 'gerne' means the children would like to help. 'vil' on its own would sound like a demand.",
        "'men' marks a contrast: ready meals are easy, but they cost more.",
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
        "'og' joins two examples of voluntary work.",
        "'vil' is a modal verb here: you decide for yourself how many hours you want to give.",
        "'men' marks a contrast: you need no qualification, but you do have to turn up.",
        "'at' introduces a subordinate clause after 'det er vigtigt' - the Danish equivalent of 'that' after 'it is important'.",
        "'når' is used for a point in time: many people start at the point when they retire.",
        "'fordi' gives the reason why the young people do it.",
        "'meget' intensifies the comparative 'mere': much more back again.",
      ],
    },
  },
];
