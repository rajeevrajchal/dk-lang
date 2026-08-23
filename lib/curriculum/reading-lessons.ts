import type { TheoryLesson } from "@/types";

// Reading lessons: Danish texts, taught rather than tested.
//
// Each one is a TheoryLesson with `kind: "reading"` and a structured text, so
// it renders in the same chapter/topic/lesson machinery as the grammar
// lessons and needs no separate route, progress table or renderer.
//
// The order is the course's order, not a difficulty ladder of its own. A text
// is placed in the chapter whose grammar it exercises, and it is written to be
// full of that grammar — the present-tense text is wall-to-wall present tense
// on purpose, so the learner meets the rule working in real Danish an hour
// after being taught it. That connection is the whole reason reading lives in
// the course rather than in a library beside it.
//
// Every text is original. Danish is checked for the level it claims: level 1
// is main clauses only, subordinate clauses do not appear before the chapter
// that teaches them, and the past tense does not appear before Chapter 9.

export const READING_LESSONS: TheoryLesson[] = [
  // -------------------------------------------------------------------
  // Level 1 — Chapter 3/4. Present tense, pronouns, main clauses only.
  // -------------------------------------------------------------------
  {
    slug: "reading-jeg-hedder-anna",
    title: "Reading: My name is Anna",
    danishName: "Jeg hedder Anna",
    kind: "reading",
    tier: 1,
    constructCodes: ["present-tense"],
    pd3Modules: [1],
    summary:
      "Your first Danish text. Eight short sentences, every one built the same way: someone, then what they do. Read it, then click anything you do not recognise.",
    primer:
      "Do not try to translate this word by word in your head. Read it once and see how much you get. Then click the words you did not know — the meaning of each one in THIS sentence is one tap away.",
    learningObjectives: [
      "Read eight connected Danish sentences without help",
      "Recognise the subject–verb pattern in every one of them",
      "Understand a short self-introduction",
    ],
    canDo: "Read a short introduction and say who the person is, where they live and what they do.",
    sections: [
      {
        heading: "Before you read",
        body: "Anna introduces herself. You already know the pattern every sentence uses: the person first, then the verb. Nothing here is in the past, and nothing has more than one clause — so if a sentence looks long, it is still just someone doing something.",
      },
    ],
    pitfalls: [
      "'Jeg hedder Anna' is 'my name is Anna', not 'I am called Anna' — Danish uses the verb 'hedde' where English uses a noun.",
      "'Vi bor' is 'we live'. The verb does not change between 'jeg bor' and 'vi bor' — Danish present tense is one form for everybody.",
    ],
    texts: [
      {
        id: "rt-jeg-hedder-anna",
        title: "My name is Anna",
        danishTitle: "Jeg hedder Anna",
        genre: "daily_life",
        level: 1,
        summary:
          "Anna introduces herself. She is 34, comes from Poland and now lives in Aarhus with her husband Piotr. They live in a flat near the centre. She works in a café and likes her job because she meets many people. She is learning Danish at a language school two evenings a week.",
        focusConstructs: ["present-tense"],
        paragraphs: [
          {
            translation:
              "Anna introduces herself: her name, her age, where she is from and where she lives now.",
            sentences: [
              {
                danish: "Jeg hedder Anna.",
                english: "My name is Anna.",
                structureNote:
                  "The simplest Danish sentence there is: subject (Jeg), then verb (hedder), then the rest. 'hedder' is the present tense of 'at hedde'.",
                constructCodes: ["present-tense"],
              },
              {
                danish: "Jeg er 34 år.",
                english: "I am 34 years old.",
                structureNote:
                  "Danish says 'jeg er 34 år' — literally 'I am 34 years'. There is no word for 'old' here.",
              },
              {
                danish: "Jeg kommer fra Polen.",
                english: "I come from Poland.",
                structureNote:
                  "'kommer fra' is the standard way to say where you are from. Countries take no article: 'fra Polen', not 'fra det Polen'.",
                constructCodes: ["present-tense"],
              },
              {
                danish: "Nu bor jeg i Aarhus.",
                english: "Now I live in Aarhus.",
                structureNote:
                  "Watch this one. 'Nu' comes first, so the verb 'bor' still has to be second — which pushes 'jeg' behind it. It is 'nu bor jeg', never 'nu jeg bor'.",
              },
            ],
          },
          {
            translation:
              "She talks about her husband and their home, then about her job at a café and why she likes it.",
            sentences: [
              {
                danish: "Jeg har en mand.",
                english: "I have a husband.",
                structureNote:
                  "'en mand' — 'mand' is an en-word, so the indefinite article is 'en'. 'har' is the present tense of 'at have'.",
              },
              {
                danish: "Han hedder Piotr.",
                english: "His name is Piotr.",
                structureNote:
                  "'Han' replaces 'min mand' — you do not repeat the noun once it is clear who you mean.",
              },
              {
                danish: "Vi bor i en lejlighed tæt på centrum.",
                english: "We live in a flat near the centre.",
                structureNote:
                  "'bor' is exactly the same form as in 'jeg bor'. Danish verbs do not change for person — 'jeg bor', 'du bor', 'vi bor'.",
                constructCodes: ["present-tense"],
              },
              {
                danish: "Jeg arbejder på en café i byen.",
                english: "I work at a café in town.",
                structureNote:
                  "'på en café' — Danish uses 'på' for workplaces where English uses 'at'. You cannot work these out from English; learn them with the place.",
                constructCodes: ["present-tense"],
              },
              {
                danish: "Jeg kan godt lide mit arbejde.",
                english: "I like my job.",
                structureNote:
                  "'kan godt lide' is a fixed expression meaning 'like'. Three words, one meaning — do not translate them separately.",
              },
              {
                danish: "Jeg møder mange mennesker.",
                english: "I meet many people.",
                structureNote:
                  "'mennesker' is already plural — 'menneske' is one person, 'mennesker' is people.",
              },
              {
                danish: "Om aftenen går jeg på sprogskole.",
                english: "In the evening I go to language school.",
                structureNote:
                  "'Om aftenen' is first, so again the subject moves behind the verb: 'går jeg'. This is the same rule as 'Nu bor jeg'.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "at hedde", english: "to be called / to be named" },
          { danish: "at bo", english: "to live (somewhere)" },
          { danish: "at arbejde", english: "to work" },
          { danish: "en lejlighed", english: "a flat / apartment" },
          { danish: "tæt på", english: "close to / near" },
          { danish: "kan godt lide", english: "to like" },
          { danish: "om aftenen", english: "in the evening" },
        ],
        glossary: [
          { surface: "hedder", lemma: "hedde", englishGloss: "am called / my name is", partOfSpeech: "verb", inflectionNote: "Present tense of 'at hedde'. Add -er to the stem; the form is the same for jeg, du, han, vi — Danish never changes the verb for person." },
          { surface: "er", lemma: "være", englishGloss: "am", partOfSpeech: "verb", inflectionNote: "Present tense of 'at være' (to be). Irregular, and one form for everybody: jeg er, du er, vi er." },
          { surface: "år", lemma: "år", englishGloss: "years", partOfSpeech: "noun", inflectionNote: "Neuter (et-word) with no plural ending: et år, to år. Used with a number to give an age: 'jeg er 34 år'." },
          { surface: "kommer", lemma: "komme", englishGloss: "come", partOfSpeech: "verb", inflectionNote: "Present tense of 'at komme'. 'komme fra' = to be from." },
          { surface: "fra", lemma: "fra", englishGloss: "from", partOfSpeech: "preposition", inflectionNote: "Does not change. Marks origin — where you started or where you are from." },
          { surface: "Nu", lemma: "nu", englishGloss: "now", partOfSpeech: "adverb", inflectionNote: "Does not change. Putting it first pushes the subject behind the verb: 'Nu bor jeg', not 'Nu jeg bor'." },
          { surface: "bor", lemma: "bo", englishGloss: "live", partOfSpeech: "verb", inflectionNote: "Present tense of 'at bo'. Short verbs like this add only -r, not -er: bo → bor." },
          { surface: "har", lemma: "have", englishGloss: "have", partOfSpeech: "verb", inflectionNote: "Present tense of 'at have'. Irregular — the form is 'har', not 'haver'." },
          { surface: "mand", lemma: "mand", englishGloss: "husband", partOfSpeech: "noun", inflectionNote: "Common gender (en-word): en mand / manden / mænd / mændene. 'Min mand' means my husband; on its own 'mand' can also just mean 'man'." },
          { surface: "Han", lemma: "han", englishGloss: "he", partOfSpeech: "pronoun", inflectionNote: "Subject form. When he is the one having something done to him it becomes 'ham'." },
          { surface: "Vi", lemma: "vi", englishGloss: "we", partOfSpeech: "pronoun", inflectionNote: "Subject form. The object form is 'os'." },
          { surface: "lejlighed", lemma: "lejlighed", englishGloss: "flat / apartment", partOfSpeech: "noun", inflectionNote: "Common gender: en lejlighed / lejligheden / lejligheder / lejlighederne." },
          { surface: "tæt", lemma: "tæt", englishGloss: "close", partOfSpeech: "adjective", inflectionNote: "Here part of the fixed phrase 'tæt på' = near / close to." },
          { surface: "centrum", lemma: "centrum", englishGloss: "the centre (of town)", partOfSpeech: "noun", inflectionNote: "Neuter. Usually used without an article: 'i centrum' = in the centre." },
          { surface: "arbejder", lemma: "arbejde", englishGloss: "work", partOfSpeech: "verb", inflectionNote: "Present tense of 'at arbejde'. The same word with no ending, 'arbejde', is also the noun 'work' — context tells you which." },
          { surface: "café", lemma: "café", englishGloss: "café", partOfSpeech: "noun", inflectionNote: "Common gender: en café / caféen. Note 'på en café' — Danish uses 'på' for workplaces." },
          { surface: "byen", lemma: "by", englishGloss: "the town / the city", partOfSpeech: "noun", inflectionNote: "Definite singular. Danish attaches 'the' to the end of the word: by → byen. There is no separate word for 'the'." },
          { surface: "kan", lemma: "kunne", englishGloss: "can", partOfSpeech: "verb", inflectionNote: "Present tense of the modal 'at kunne'. Here it is part of the fixed expression 'kan godt lide' = like." },
          { surface: "godt", lemma: "god", englishGloss: "well", partOfSpeech: "adverb", inflectionNote: "In 'kan godt lide' it is not translated separately — the three words together mean 'like'." },
          { surface: "lide", lemma: "lide", englishGloss: "like", partOfSpeech: "verb", inflectionNote: "Infinitive form, held in place by 'kan'. After a modal verb the next verb always stays in the infinitive." },
          { surface: "mit", lemma: "min", englishGloss: "my", partOfSpeech: "pronoun", inflectionNote: "Neuter form of 'min', because 'arbejde' is an et-word. It is 'mit arbejde' but 'min mand'." },
          { surface: "møder", lemma: "møde", englishGloss: "meet", partOfSpeech: "verb", inflectionNote: "Present tense of 'at møde'." },
          { surface: "mange", lemma: "mange", englishGloss: "many", partOfSpeech: "adjective", inflectionNote: "Only used with plurals, and does not change: mange mennesker, mange dage." },
          { surface: "mennesker", lemma: "menneske", englishGloss: "people", partOfSpeech: "noun", inflectionNote: "Plural of 'menneske' (a human being). Neuter: et menneske / mennesket / mennesker / menneskene." },
          { surface: "aftenen", lemma: "aften", englishGloss: "the evening", partOfSpeech: "noun", inflectionNote: "Definite singular: aften → aftenen. 'Om aftenen' means 'in the evening' as a habit, not one particular evening." },
          { surface: "går", lemma: "gå", englishGloss: "go", partOfSpeech: "verb", inflectionNote: "Present tense of 'at gå'. A short verb, so it adds only -r: gå → går." },
          { surface: "sprogskole", lemma: "sprogskole", englishGloss: "language school", partOfSpeech: "noun", inflectionNote: "Common gender: en sprogskole / sprogskolen. 'på sprogskole' with no article is the normal way to say you attend one." },
        ],
      },
    ],
    exercises: [
      {
        id: "rd-anna-1",
        kind: "recognition",
        instruction: "Which word tells you what Anna does for a living?",
        sentence: "Jeg arbejder på en café i byen.",
        answerIndex: 1,
        explanation:
          "'arbejder' — the verb. In Danish the verb is almost always the second thing in the sentence, so once you find position 2 you have found the action.",
      },
      {
        id: "rd-anna-2",
        kind: "selection",
        instruction: "Anna lives in Aarhus. Complete the sentence.",
        sentence: "Nu ___ jeg i Aarhus.",
        options: ["bor", "bo", "boer"],
        answer: "bor",
        explanation:
          "'bo' is a short verb, so the present tense adds only -r: bo → bor. And because 'Nu' is first, the verb has to come straight after it.",
      },
      {
        id: "rd-anna-3",
        kind: "matching",
        instruction: "Match the Danish to the English.",
        pairs: [
          { left: "Jeg kommer fra Polen", right: "I come from Poland" },
          { left: "Vi bor i en lejlighed", right: "We live in a flat" },
          { left: "Jeg møder mange mennesker", right: "I meet many people" },
        ],
        explanation: "Each is subject, then verb, then the rest — the same shape every time.",
      },
      {
        id: "rd-anna-4",
        kind: "ordering",
        instruction: "Put the words in order to say 'In the evening I go to language school'.",
        scrambled: ["sprogskole", "jeg", "Om", "aftenen", "går", "på"],
        answer: ["Om", "aftenen", "går", "jeg", "på", "sprogskole"],
        explanation:
          "'Om aftenen' takes position 1, so the verb 'går' must be second and 'jeg' lands in third place. This is the one word-order rule that catches everybody.",
      },
      {
        id: "rd-anna-5",
        kind: "controlled_production",
        instruction: "Answer in Danish: Hvor bor Anna?",
        prompt: "Hvor bor Anna?",
        acceptedAnswers: ["Hun bor i Aarhus", "Hun bor i Aarhus.", "I Aarhus", "Anna bor i Aarhus"],
        hint: "Start with 'Hun bor ...'",
        explanation: "'Hun bor i Aarhus.' — 'hun' is 'she', and 'bor' does not change form.",
      },
      {
        id: "rd-anna-6",
        kind: "communication",
        instruction: "Now introduce yourself the same way Anna did.",
        prompt: "Fortæl om dig selv: Hvad hedder du? Hvor kommer du fra? Hvor bor du? Hvad laver du?",
        demand: "factual",
        usefulPhrases: [
          "Jeg hedder ...",
          "Jeg kommer fra ...",
          "Jeg bor i ...",
          "Jeg arbejder på/i ...",
          "Jeg går på sprogskole.",
        ],
      },
    ],
  },

  // -------------------------------------------------------------------
  // Level 2 — Chapter 4. Present tense across a whole day, plus the time
  // expressions that force inversion.
  // -------------------------------------------------------------------
  {
    slug: "reading-min-hverdag",
    title: "Reading: My everyday life",
    danishName: "Min hverdag",
    kind: "reading",
    tier: 1,
    constructCodes: ["present-tense"],
    pd3Modules: [1, 2],
    summary:
      "A whole day in Danish, from getting up to going to bed. Longer sentences than the last text, joined with 'og' — and a lot of times of day, which is where Danish word order bites.",
    primer:
      "Almost every sentence here starts with a time. That is normal Danish, and it means the subject keeps landing after the verb. Watch for it: 'Klokken syv står jeg op', not 'Klokken syv jeg står op'.",
    learningObjectives: [
      "Follow a description of somebody's day from morning to evening",
      "Recognise the time expressions Danes actually use",
      "See why the subject moves when a sentence starts with a time",
    ],
    canDo: "Understand somebody describing their daily routine, and describe your own.",
    sections: [
      {
        heading: "Before you read",
        body: "Omar describes an ordinary Tuesday. Nothing unusual happens — that is the point. This is the vocabulary of a normal day, which is exactly what Modul 1 and 2 ask you to talk about.",
      },
      {
        heading: "One thing to notice",
        body: "'står op' is two words that mean one thing: get up. Danish has a lot of these. If you translate 'står' and 'op' separately you get 'stand up', which is not wrong exactly, but 'get up in the morning' is what it means here.",
      },
    ],
    pitfalls: [
      "'Klokken syv' is 'at seven o'clock'. Danish uses 'klokken' where English uses 'at'.",
      "'i dag' (today) is two words. 'idag' is a common misspelling.",
      "'hjem' means 'home' as a direction (going home); 'hjemme' means 'at home' as a place. 'Jeg kommer hjem' but 'Jeg er hjemme'.",
    ],
    texts: [
      {
        id: "rt-min-hverdag",
        title: "My everyday life",
        danishTitle: "Min hverdag",
        genre: "daily_life",
        level: 2,
        summary:
          "Omar describes an ordinary weekday. He gets up at seven, has breakfast with his daughter and takes her to school. He takes the bus to work and works from eight to four in a warehouse. After work he shops, cooks and eats with his family. In the evening he does his Danish homework and watches television, and he goes to bed at about eleven.",
        focusConstructs: ["present-tense"],
        paragraphs: [
          {
            translation:
              "Omar's morning: getting up, breakfast with his daughter, and taking her to school before catching the bus.",
            sentences: [
              {
                danish: "Klokken syv står jeg op.",
                english: "I get up at seven o'clock.",
                structureNote:
                  "'Klokken syv' fills position 1, so the verb 'står' comes second and 'jeg' is pushed to third. 'står op' is one idea: get up.",
              },
              {
                danish: "Jeg spiser morgenmad sammen med min datter.",
                english: "I have breakfast with my daughter.",
                structureNote:
                  "Back to the plain order — subject, verb, rest — because the sentence starts with 'Jeg'. 'sammen med' = together with.",
                constructCodes: ["present-tense"],
              },
              {
                danish: "Hun er syv år, og hun går i skole.",
                english: "She is seven years old, and she goes to school.",
                structureNote:
                  "Two complete sentences joined by 'og'. Both keep their own subject and verb in the normal order — 'og' does not change anything after it.",
                constructCodes: ["coordination"],
              },
              {
                danish: "Jeg følger hende i skole, og så tager jeg bussen på arbejde.",
                english: "I take her to school, and then I take the bus to work.",
                structureNote:
                  "After 'og' comes 'så' (then), and 'så' takes position 1 in its own half — so the verb 'tager' comes second and 'jeg' follows it.",
                constructCodes: ["coordination"],
              },
            ],
          },
          {
            translation:
              "His working day: eight to four in a warehouse, lunch at noon with colleagues.",
            sentences: [
              {
                danish: "Jeg arbejder fra klokken otte til fire.",
                english: "I work from eight until four.",
                structureNote: "'fra ... til ...' is the standard way to give a span of time.",
                constructCodes: ["present-tense"],
              },
              {
                danish: "Jeg arbejder på et lager uden for byen.",
                english: "I work at a warehouse outside town.",
                structureNote:
                  "'et lager' — 'lager' is an et-word. 'uden for' (outside) is two words when it means physically outside something.",
              },
              {
                danish: "Klokken tolv holder vi pause og spiser frokost.",
                english: "At twelve we take a break and have lunch.",
                structureNote:
                  "'Klokken tolv' first, so 'holder vi'. The second verb 'spiser' shares the subject 'vi' and does not repeat it.",
              },
            ],
          },
          {
            translation:
              "His evening: shopping, cooking, eating together, homework, television, and bed at about eleven.",
            sentences: [
              {
                danish: "Om eftermiddagen henter jeg min datter.",
                english: "In the afternoon I pick up my daughter.",
                structureNote:
                  "Same inversion again: 'Om eftermiddagen' is first, so it is 'henter jeg'.",
              },
              {
                danish: "Vi køber ind, og bagefter laver jeg mad.",
                english: "We do the shopping, and afterwards I cook.",
                structureNote:
                  "'køber ind' = do the shopping; 'laver mad' = cook. Both are two-word expressions with a single meaning.",
                constructCodes: ["coordination"],
              },
              {
                danish: "Vi spiser sammen klokken seks.",
                english: "We eat together at six.",
                structureNote: "'sammen' = together. Here the time comes last, so no inversion.",
              },
              {
                danish: "Om aftenen laver jeg lektier til sprogskolen.",
                english: "In the evening I do homework for the language school.",
                structureNote: "'lave lektier' = do homework. 'til' here means 'for'.",
              },
              {
                danish: "Jeg går i seng omkring klokken elleve.",
                english: "I go to bed at about eleven.",
                structureNote:
                  "'går i seng' = go to bed. 'omkring' = around/about, used with times and numbers.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "at stå op", english: "to get up" },
          { danish: "morgenmad", english: "breakfast" },
          { danish: "at følge nogen i skole", english: "to take someone to school" },
          { danish: "at tage bussen", english: "to take the bus" },
          { danish: "at holde pause", english: "to take a break" },
          { danish: "at hente", english: "to pick up / collect" },
          { danish: "at købe ind", english: "to do the shopping" },
          { danish: "at lave mad", english: "to cook" },
          { danish: "lektier", english: "homework" },
          { danish: "at gå i seng", english: "to go to bed" },
        ],
        glossary: [
          { surface: "Klokken", lemma: "klokke", englishGloss: "at (o'clock)", partOfSpeech: "noun", inflectionNote: "Definite form of 'klokke' (bell/clock). Put in front of a number it tells the time: klokken syv = seven o'clock." },
          { surface: "står", lemma: "stå", englishGloss: "get (up)", partOfSpeech: "verb", inflectionNote: "Present tense of 'at stå'. Short verb, so it adds only -r. With 'op' it means 'get up', not 'stand'." },
          { surface: "op", lemma: "op", englishGloss: "up", partOfSpeech: "adverb", inflectionNote: "Part of 'stå op'. Danish has many verb + particle pairs like this where the pair means something the verb alone does not." },
          { surface: "spiser", lemma: "spise", englishGloss: "eat / have", partOfSpeech: "verb", inflectionNote: "Present tense of 'at spise'." },
          { surface: "morgenmad", lemma: "morgenmad", englishGloss: "breakfast", partOfSpeech: "noun", inflectionNote: "Common gender, normally used with no article: 'spise morgenmad'. Literally 'morning food'." },
          { surface: "sammen", lemma: "sammen", englishGloss: "together", partOfSpeech: "adverb", inflectionNote: "Does not change. 'sammen med' = together with." },
          { surface: "datter", lemma: "datter", englishGloss: "daughter", partOfSpeech: "noun", inflectionNote: "Common gender: en datter / datteren / døtre / døtrene. The plural changes the vowel." },
          { surface: "følger", lemma: "følge", englishGloss: "take / accompany", partOfSpeech: "verb", inflectionNote: "Present tense of 'at følge'. 'følge nogen i skole' = take somebody to school." },
          { surface: "hende", lemma: "hun", englishGloss: "her", partOfSpeech: "pronoun", inflectionNote: "Object form of 'hun'. She does something = 'hun'; something is done to her = 'hende'." },
          { surface: "tager", lemma: "tage", englishGloss: "take", partOfSpeech: "verb", inflectionNote: "Present tense of 'at tage'. 'tage bussen' = take the bus." },
          { surface: "bussen", lemma: "bus", englishGloss: "the bus", partOfSpeech: "noun", inflectionNote: "Definite singular: bus → bussen. The consonant doubles before the ending." },
          { surface: "lager", lemma: "lager", englishGloss: "warehouse", partOfSpeech: "noun", inflectionNote: "Neuter (et-word): et lager / lageret / lagre / lagrene." },
          { surface: "holder", lemma: "holde", englishGloss: "take", partOfSpeech: "verb", inflectionNote: "Present tense of 'at holde'. 'holde pause' is fixed: take a break." },
          { surface: "eftermiddagen", lemma: "eftermiddag", englishGloss: "the afternoon", partOfSpeech: "noun", inflectionNote: "Definite singular. 'Om eftermiddagen' = in the afternoon, as a routine." },
          { surface: "henter", lemma: "hente", englishGloss: "pick up", partOfSpeech: "verb", inflectionNote: "Present tense of 'at hente' — fetch or collect somebody or something." },
          { surface: "køber", lemma: "købe", englishGloss: "buy", partOfSpeech: "verb", inflectionNote: "Present tense of 'at købe'. With 'ind' it becomes 'do the shopping'." },
          { surface: "bagefter", lemma: "bagefter", englishGloss: "afterwards", partOfSpeech: "adverb", inflectionNote: "Does not change. Starting a clause with it pushes the subject after the verb." },
          { surface: "laver", lemma: "lave", englishGloss: "make / do", partOfSpeech: "verb", inflectionNote: "Present tense of 'at lave'. Very common: 'lave mad' = cook, 'lave lektier' = do homework." },
          { surface: "lektier", lemma: "lektie", englishGloss: "homework", partOfSpeech: "noun", inflectionNote: "Plural of 'lektie', and almost always used in the plural." },
          { surface: "seng", lemma: "seng", englishGloss: "bed", partOfSpeech: "noun", inflectionNote: "Common gender: en seng / sengen. 'gå i seng' = go to bed, with no article." },
          { surface: "omkring", lemma: "omkring", englishGloss: "around / about", partOfSpeech: "preposition", inflectionNote: "Used with times and quantities to mean approximately." },
        ],
      },
    ],
    exercises: [
      {
        id: "rd-hverdag-1",
        kind: "selection",
        instruction: "Complete the sentence the way the text does.",
        sentence: "Klokken syv ___ jeg op.",
        options: ["står", "jeg står", "stå"],
        answer: "står",
        explanation:
          "'Klokken syv' is already position 1, so the verb has to be next. Putting 'jeg' in front of the verb would give it two things in position 1.",
      },
      {
        id: "rd-hverdag-2",
        kind: "matching",
        instruction: "Match each two-word expression to what it means.",
        pairs: [
          { left: "står op", right: "gets up" },
          { left: "holder pause", right: "takes a break" },
          { left: "køber ind", right: "does the shopping" },
          { left: "laver mad", right: "cooks" },
        ],
        explanation:
          "None of these can be worked out from the two words separately. Learn them as single items.",
      },
      {
        id: "rd-hverdag-3",
        kind: "ordering",
        instruction: "Build: 'In the afternoon I pick up my daughter.'",
        scrambled: ["min", "eftermiddagen", "henter", "Om", "datter", "jeg"],
        answer: ["Om", "eftermiddagen", "henter", "jeg", "min", "datter"],
        explanation:
          "Time first, verb second, subject third. The same shape as 'Klokken syv står jeg op'.",
      },
      {
        id: "rd-hverdag-4",
        kind: "controlled_production",
        instruction: "Answer in Danish: Hvornår går Omar i seng?",
        prompt: "Hvornår går Omar i seng?",
        acceptedAnswers: [
          "Han går i seng omkring klokken elleve",
          "Han går i seng omkring klokken elleve.",
          "Omkring klokken elleve",
          "Klokken elleve",
        ],
        hint: "Start with 'Han går i seng ...'",
        explanation: "'Han går i seng omkring klokken elleve.'",
      },
      {
        id: "rd-hverdag-5",
        kind: "communication",
        instruction: "Describe your own day out loud, in the same order the text uses.",
        prompt: "Fortæl om din hverdag. Hvornår står du op? Hvad laver du om formiddagen, om eftermiddagen og om aftenen?",
        demand: "description",
        usefulPhrases: [
          "Klokken ... står jeg op.",
          "Om formiddagen ...",
          "Jeg arbejder fra ... til ...",
          "Om aftenen ...",
          "Jeg går i seng klokken ...",
        ],
      },
    ],
  },
  // -------------------------------------------------------------------
  // Level 2 — Chapter 5. The Danish you actually meet in a week: a text
  // message, a notice on a board, a housing advert, a short email. Four
  // texts in one lesson, because the point is the differences between them.
  // -------------------------------------------------------------------
  {
    slug: "reading-beskeder-og-opslag",
    title: "Reading: Messages, notices and adverts",
    danishName: "Beskeder og opslag",
    kind: "reading",
    tier: 1,
    constructCodes: [],
    pd3Modules: [1, 2],
    summary:
      "Most of the Danish you meet in a week is not prose. It is a text from a colleague, a note on the noticeboard, an advert for a flat, a short email from the school. Each has its own shape, and each leaves things out.",
    primer:
      "Real Danish messages drop words. A notice says 'Lukket mandag', not 'Der er lukket om mandagen'. That is not broken Danish — it is how these texts work, and knowing what has been left out is most of the skill.",
    learningObjectives: [
      "Read a text message, a notice, an advert and a short email",
      "Find the practical information: when, where, how much, who to contact",
      "Recognise that these text types leave words out on purpose",
    ],
    canDo: "Get the practical facts out of a short everyday Danish message.",
    sections: [
      {
        heading: "What to look for",
        body: "You do not need to understand every word of an advert. You need to find four things: what is on offer, when, where, and what it costs or what you must do. Read for those, and let the rest go.",
      },
      {
        heading: "Words that get left out",
        body: "Notices and adverts drop 'der er', 'jeg', and articles. 'Lukket mandag' is a whole sentence: 'It is closed on Mondays'. Adverts drop verbs entirely: '2 vær., 65 m², 7.500 kr./md.' is a complete description of a flat.",
      },
    ],
    pitfalls: [
      "'Hilsen' at the end of a message is 'regards', not a name.",
      "'md.' is short for 'måned' (month). 'kr./md.' is kroner per month.",
      "'vær.' is short for 'værelser' (rooms). Danish adverts abbreviate heavily.",
      "'senest' means 'at the latest', not 'lately'.",
    ],
    texts: [
      {
        id: "rt-sms-kollega",
        title: "A text from a colleague",
        danishTitle: "SMS fra en kollega",
        genre: "sms",
        level: 2,
        summary:
          "Lise texts to say she is ill and cannot come to work today. She asks whether her colleague can take the ten o'clock meeting, and says she has emailed the papers.",
        paragraphs: [
          {
            translation:
              "Lise is ill, is not coming in, and asks a favour about the morning meeting.",
            sentences: [
              {
                danish: "Hej Omar",
                english: "Hi Omar",
                structureNote:
                  "'Hej' plus the name is the normal opening for a message between colleagues. No comma after it in Danish.",
              },
              {
                danish: "Jeg er desværre syg i dag.",
                english: "I am unfortunately ill today.",
                structureNote:
                  "'desværre' (unfortunately) sits after the verb. It is the standard way to soften bad news.",
              },
              {
                danish: "Kan du tage mødet klokken ti?",
                english: "Can you take the ten o'clock meeting?",
                structureNote:
                  "A yes/no question: the verb 'Kan' comes first and the subject 'du' second. No question word needed.",
              },
              {
                danish: "Jeg har sendt papirerne på mail.",
                english: "I have sent the papers by email.",
                structureNote:
                  "'har sendt' — 'har' plus the participle. This is the tense Danes use for something just done.",
              },
              {
                danish: "Hilsen Lise",
                english: "Regards, Lise",
                structureNote: "'Hilsen' plus the name is the short, informal sign-off.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "desværre", english: "unfortunately" },
          { danish: "syg", english: "ill / sick" },
          { danish: "et møde", english: "a meeting" },
          { danish: "hilsen", english: "regards" },
        ],
        glossary: [
          { surface: "desværre", lemma: "desværre", englishGloss: "unfortunately", partOfSpeech: "adverb", inflectionNote: "Does not change. Almost always placed straight after the verb: 'Jeg er desværre ...'." },
          { surface: "syg", lemma: "syg", englishGloss: "ill", partOfSpeech: "adjective", inflectionNote: "Base form, agreeing with 'jeg'. Neuter would be 'sygt', plural 'syge'." },
          { surface: "Kan", lemma: "kunne", englishGloss: "can", partOfSpeech: "verb", inflectionNote: "Present tense of the modal 'at kunne'. First in the sentence, which is what makes this a yes/no question." },
          { surface: "tage", lemma: "tage", englishGloss: "take", partOfSpeech: "verb", inflectionNote: "Infinitive, held there by the modal 'kan'. After kan/skal/vil the next verb never takes an ending." },
          { surface: "mødet", lemma: "møde", englishGloss: "the meeting", partOfSpeech: "noun", inflectionNote: "Definite singular of the et-word 'møde': et møde → mødet." },
          { surface: "sendt", lemma: "sende", englishGloss: "sent", partOfSpeech: "verb", inflectionNote: "Past participle of 'at sende', used with 'har' to say something has been done." },
          { surface: "papirerne", lemma: "papir", englishGloss: "the papers", partOfSpeech: "noun", inflectionNote: "Definite plural: papir → papirer → papirerne." },
          { surface: "Hilsen", lemma: "hilsen", englishGloss: "regards", partOfSpeech: "noun", inflectionNote: "Literally 'a greeting'. On its own before a name it is the informal sign-off; 'Venlig hilsen' is the neutral one." },
        ],
      },
      {
        id: "rt-opslag-vaskeri",
        title: "A notice in the laundry room",
        danishTitle: "Opslag i vaskekælderen",
        genre: "notice",
        level: 2,
        summary:
          "A notice from the caretaker: the laundry room is closed on Monday 14 April because a machine is being repaired. Residents should book another day, and questions go to the caretaker on the number given.",
        paragraphs: [
          {
            translation: "The laundry is closed for one day for a repair, and what to do about it.",
            sentences: [
              {
                danish: "VIGTIGT",
                english: "IMPORTANT",
                structureNote: "One word, in capitals. Notices lead with the point.",
              },
              {
                danish: "Vaskekælderen er lukket mandag den 14. april.",
                english: "The laundry room is closed on Monday 14 April.",
                structureNote:
                  "Dates: 'den 14. april'. The full stop after the number is what makes it 'the 14th'.",
              },
              {
                danish: "En maskine skal repareres.",
                english: "A machine has to be repaired.",
                structureNote:
                  "'skal repareres' — the -s ending on the verb makes it passive. Who does the repairing is not said, because it does not matter.",
                constructCodes: ["passive-voice"],
              },
              {
                danish: "Book venligst en anden dag.",
                english: "Please book another day.",
                structureNote:
                  "An instruction: the verb comes first with no subject. 'venligst' is the polite 'please' of written Danish.",
              },
              {
                danish: "Spørgsmål? Ring til viceværten på 20 14 88 03.",
                english: "Questions? Call the caretaker on 20 14 88 03.",
                structureNote:
                  "'Spørgsmål?' is a whole question with everything but the noun removed — normal in a notice.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "vigtigt", english: "important" },
          { danish: "lukket", english: "closed" },
          { danish: "venligst", english: "please (formal, written)" },
          { danish: "en vicevært", english: "a caretaker" },
        ],
        glossary: [
          { surface: "VIGTIGT", lemma: "vigtig", englishGloss: "important", partOfSpeech: "adjective", inflectionNote: "Neuter form (+t) used on its own as a heading, the way English uses 'IMPORTANT'." },
          { surface: "Vaskekælderen", lemma: "vaskekælder", englishGloss: "the laundry room", partOfSpeech: "noun", inflectionNote: "Definite singular of a compound: vaske (wash) + kælder (basement). Danish builds long nouns by gluing words together." },
          { surface: "lukket", lemma: "lukke", englishGloss: "closed", partOfSpeech: "adjective", inflectionNote: "Past participle of 'at lukke', used here as an adjective after 'er'. The opposite is 'åbent'." },
          { surface: "skal", lemma: "skulle", englishGloss: "has to / is to", partOfSpeech: "verb", inflectionNote: "Present tense of the modal 'at skulle'. Expresses something arranged or required." },
          { surface: "repareres", lemma: "reparere", englishGloss: "be repaired", partOfSpeech: "verb", inflectionNote: "The -s passive: 'reparere' → 'repareres' = be repaired. Danish uses this a lot in official notices, where nobody wants to name who is responsible." },
          { surface: "venligst", lemma: "venlig", englishGloss: "please", partOfSpeech: "adverb", inflectionNote: "From 'venlig' (friendly). Used in written instructions; you would not say it out loud to a friend." },
          { surface: "Spørgsmål", lemma: "spørgsmål", englishGloss: "questions", partOfSpeech: "noun", inflectionNote: "Neuter with no plural ending: et spørgsmål, to spørgsmål." },
          { surface: "viceværten", lemma: "vicevært", englishGloss: "the caretaker", partOfSpeech: "noun", inflectionNote: "Definite singular. The person who looks after a block of flats — a job title you will meet often as a tenant." },
        ],
      },
      {
        id: "rt-boligannonce",
        title: "A housing advert",
        danishTitle: "Boligannonce",
        genre: "advertisement",
        level: 2,
        summary:
          "A two-room flat of 65 m² in Aarhus V, on the third floor with a balcony, at 7,500 kroner a month plus utilities. Available from 1 June, no pets, deposit of three months. Write to Karin with a little about yourself.",
        paragraphs: [
          {
            translation: "The flat: size, location, floor, price and what is included.",
            sentences: [
              {
                danish: "2-værelses lejlighed i Aarhus V, 65 m².",
                english: "Two-room flat in Aarhus V, 65 m².",
                structureNote:
                  "No verb at all. Adverts describe by listing, and the reader supplies the 'this is a'.",
              },
              {
                danish: "3. sal med altan og elevator.",
                english: "Third floor with balcony and lift.",
                structureNote: "'3. sal' — the full stop again makes the number an ordinal: third.",
              },
              {
                danish: "Husleje 7.500 kr./md. + forbrug.",
                english: "Rent 7,500 kr. per month plus utilities.",
                structureNote:
                  "Danish uses a full stop as the thousands separator: 7.500 is seven and a half thousand, not seven point five.",
              },
              {
                danish: "Ledig fra 1. juni.",
                english: "Available from 1 June.",
                structureNote: "'Ledig' = free, vacant. Another verbless line.",
              },
            ],
          },
          {
            translation: "The conditions, and how to apply.",
            sentences: [
              {
                danish: "Ingen husdyr.",
                english: "No pets.",
                structureNote: "'Ingen' = no / not any, in front of a noun.",
              },
              {
                danish: "Depositum: 3 måneders husleje.",
                english: "Deposit: three months' rent.",
                structureNote:
                  "'3 måneders husleje' — the -s on 'måneders' is possessive, exactly like the English apostrophe-s.",
              },
              {
                danish: "Skriv til Karin og fortæl lidt om dig selv.",
                english: "Write to Karin and tell her a little about yourself.",
                structureNote:
                  "Two instructions joined by 'og'. Both verbs come first with no subject — that is what makes them instructions.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "husleje", english: "rent" },
          { danish: "forbrug", english: "utilities (heat, water, electricity)" },
          { danish: "ledig", english: "available / vacant" },
          { danish: "depositum", english: "deposit" },
          { danish: "husdyr", english: "pets" },
        ],
        glossary: [
          { surface: "værelses", lemma: "værelse", englishGloss: "-room", partOfSpeech: "noun", inflectionNote: "Possessive -s inside the compound '2-værelses' = two-room. In adverts it is usually abbreviated to '2 vær.'." },
          { surface: "sal", lemma: "sal", englishGloss: "floor / storey", partOfSpeech: "noun", inflectionNote: "'3. sal' = third floor. Danish ground floor is 'stuen', so '1. sal' is what a British speaker calls the first floor." },
          { surface: "altan", lemma: "altan", englishGloss: "balcony", partOfSpeech: "noun", inflectionNote: "Common gender: en altan / altanen." },
          { surface: "Husleje", lemma: "husleje", englishGloss: "rent", partOfSpeech: "noun", inflectionNote: "Compound: hus (house) + leje (rent). Common gender: en husleje / huslejen." },
          { surface: "forbrug", lemma: "forbrug", englishGloss: "utilities / consumption", partOfSpeech: "noun", inflectionNote: "Neuter. In a housing advert it means heating, water and electricity, charged on top of the rent." },
          { surface: "Ledig", lemma: "ledig", englishGloss: "available", partOfSpeech: "adjective", inflectionNote: "Used of a flat, a seat or a job. 'Ledig fra' = available from." },
          { surface: "Ingen", lemma: "ingen", englishGloss: "no / not any", partOfSpeech: "pronoun", inflectionNote: "Used in front of a noun to say there are none. Neuter form is 'intet'." },
          { surface: "husdyr", lemma: "husdyr", englishGloss: "pets", partOfSpeech: "noun", inflectionNote: "Neuter, same form in singular and plural: et husdyr, to husdyr." },
          { surface: "Depositum", lemma: "depositum", englishGloss: "deposit", partOfSpeech: "noun", inflectionNote: "Neuter. The money held while you rent — normally three months' rent in Denmark." },
          { surface: "måneders", lemma: "måned", englishGloss: "months'", partOfSpeech: "noun", inflectionNote: "Possessive plural: måned → måneder → måneders. The -s does the job of the English apostrophe." },
          { surface: "fortæl", lemma: "fortælle", englishGloss: "tell", partOfSpeech: "verb", inflectionNote: "Imperative — the bare stem, with no -er and no subject. This is how Danish gives an instruction." },
          { surface: "selv", lemma: "selv", englishGloss: "-self", partOfSpeech: "pronoun", inflectionNote: "'dig selv' = yourself. Used when the object is the same person as the subject." },
        ],
      },
      {
        id: "rt-email-sprogskolen",
        title: "An email from the language school",
        danishTitle: "E-mail fra sprogskolen",
        genre: "email",
        level: 2,
        summary:
          "The language school writes to say that teaching on Thursday 8 May is cancelled because of a staff meeting. The class is moved to Friday at the same time, and students should reply if they cannot make it.",
        paragraphs: [
          {
            translation: "The school cancels Thursday and moves the class to Friday.",
            sentences: [
              {
                danish: "Kære kursist",
                english: "Dear student",
                structureNote:
                  "'Kære' plus a noun is the standard opening of a written Danish letter or email.",
              },
              {
                danish: "Undervisningen torsdag den 8. maj er aflyst.",
                english: "Teaching on Thursday 8 May is cancelled.",
                structureNote:
                  "'er aflyst' — 'er' plus a participle, describing the state something is in.",
              },
              {
                danish: "Vi holder personalemøde den dag.",
                english: "We are holding a staff meeting that day.",
                structureNote:
                  "Present tense used for a fixed future arrangement, exactly as English says 'we're holding'.",
              },
              {
                danish: "Timen er flyttet til fredag klokken 9.",
                english: "The class has been moved to Friday at nine.",
                structureNote: "'er flyttet' — another 'er' plus participle.",
              },
              {
                danish: "Skriv til os, hvis du ikke kan komme.",
                english: "Write to us if you cannot come.",
                structureNote:
                  "'hvis' opens a subordinate clause, and inside it 'ikke' comes BEFORE the verb: 'hvis du ikke kan'. In a main clause it would be 'du kan ikke'.",
                constructCodes: ["subordinate-clauses"],
              },
              {
                danish: "Venlig hilsen\nSprogcenter Aarhus",
                english: "Kind regards, Sprogcenter Aarhus",
                structureNote:
                  "'Venlig hilsen' is the neutral sign-off — right for a school, a landlord or a workplace.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "kære", english: "dear (opening a letter)" },
          { danish: "undervisning", english: "teaching / lessons" },
          { danish: "aflyst", english: "cancelled" },
          { danish: "flyttet", english: "moved" },
          { danish: "venlig hilsen", english: "kind regards" },
        ],
        glossary: [
          { surface: "Kære", lemma: "kær", englishGloss: "dear", partOfSpeech: "adjective", inflectionNote: "The -e ending is the definite/plural form, used here because it opens an address. Always 'Kære', never 'Kær', at the top of a letter." },
          { surface: "kursist", lemma: "kursist", englishGloss: "student / course participant", partOfSpeech: "noun", inflectionNote: "Common gender: en kursist / kursisten. The word Danish language schools use for their adult students." },
          { surface: "Undervisningen", lemma: "undervisning", englishGloss: "the teaching / the lessons", partOfSpeech: "noun", inflectionNote: "Definite singular. Uncountable in Danish, like the English 'teaching'." },
          { surface: "aflyst", lemma: "aflyse", englishGloss: "cancelled", partOfSpeech: "verb", inflectionNote: "Past participle of 'at aflyse', used with 'er' to describe the state: it is cancelled." },
          { surface: "personalemøde", lemma: "personalemøde", englishGloss: "staff meeting", partOfSpeech: "noun", inflectionNote: "Compound: personale (staff) + møde (meeting). Neuter: et personalemøde." },
          { surface: "Timen", lemma: "time", englishGloss: "the class / the lesson", partOfSpeech: "noun", inflectionNote: "Definite singular of 'time', which means both 'hour' and 'lesson'." },
          { surface: "flyttet", lemma: "flytte", englishGloss: "moved", partOfSpeech: "verb", inflectionNote: "Past participle of 'at flytte'. 'flytte' also means to move house — 'jeg flytter på fredag' = I'm moving on Friday." },
          { surface: "hvis", lemma: "hvis", englishGloss: "if", partOfSpeech: "conjunction", inflectionNote: "Opens a subordinate clause. Inside that clause 'ikke' goes in front of the verb, which is the opposite of a main clause." },
          { surface: "Venlig", lemma: "venlig", englishGloss: "kind / friendly", partOfSpeech: "adjective", inflectionNote: "Base form agreeing with the en-word 'hilsen'. 'Venlig hilsen' is the standard neutral sign-off." },
          { surface: "torsdag", lemma: "torsdag", englishGloss: "Thursday", partOfSpeech: "noun", inflectionNote: "Days of the week take no article and no capital letter: 'på torsdag' = on Thursday." },
          { surface: "fredag", lemma: "fredag", englishGloss: "Friday", partOfSpeech: "noun", inflectionNote: "Same pattern as the other weekdays. 'til fredag' = to Friday." },
          { surface: "holder", lemma: "holde", englishGloss: "are holding", partOfSpeech: "verb", inflectionNote: "Present of 'at holde'. 'holde møde' = hold a meeting, one of many fixed 'holde' expressions." },
          { surface: "klokken", lemma: "klokke", englishGloss: "at (o'clock)", partOfSpeech: "noun", inflectionNote: "Definite form of 'klokke'. Put before a number it tells the time: klokken 9." },
          { surface: "Skriv", lemma: "skrive", englishGloss: "write", partOfSpeech: "verb", inflectionNote: "Imperative — the bare stem with no ending and no subject. This is how Danish gives an instruction." },
          { surface: "komme", lemma: "komme", englishGloss: "come", partOfSpeech: "verb", inflectionNote: "Infinitive, held there by 'kan'. After a modal the next verb never takes an ending." },
          { surface: "hilsen", lemma: "hilsen", englishGloss: "regards", partOfSpeech: "noun", inflectionNote: "Literally 'a greeting'. 'Venlig hilsen' is the neutral sign-off for a school, a landlord or a workplace." },
          { surface: "Sprogcenter", lemma: "sprogcenter", englishGloss: "language centre", partOfSpeech: "noun", inflectionNote: "Neuter compound: sprog (language) + center. The official name for the schools that teach Danskuddannelse." },
        ],
      },
    ],
    exercises: [
      {
        id: "rd-beskeder-1",
        kind: "selection",
        instruction: "Lise's message: what does she want Omar to do?",
        sentence: "Kan du ___ mødet klokken ti?",
        options: ["tage", "tager", "tog"],
        answer: "tage",
        explanation:
          "After a modal verb like 'kan', the next verb stays in the infinitive: 'kan tage', never 'kan tager'.",
      },
      {
        id: "rd-beskeder-2",
        kind: "matching",
        instruction: "Match each abbreviation to what it stands for.",
        pairs: [
          { left: "vær.", right: "værelser (rooms)" },
          { left: "md.", right: "måned (month)" },
          { left: "kr.", right: "kroner" },
          { left: "m²", right: "kvadratmeter" },
        ],
        explanation:
          "Housing adverts are almost entirely abbreviations. These four cover most of what you need.",
      },
      {
        id: "rd-beskeder-3",
        kind: "ordering",
        instruction: "Build the sentence from the school's email: 'Write to us if you cannot come.'",
        scrambled: ["ikke", "til", "hvis", "os,", "Skriv", "komme", "du", "kan"],
        answer: ["Skriv", "til", "os,", "hvis", "du", "ikke", "kan", "komme"],
        explanation:
          "After 'hvis' the clause is subordinate, and in a subordinate clause 'ikke' goes in FRONT of the verb: 'hvis du ikke kan komme'. In a main clause you would say 'du kan ikke komme'.",
      },
      {
        id: "rd-beskeder-4",
        kind: "controlled_production",
        instruction: "Read the housing advert. How much is the rent per month?",
        prompt: "Hvor meget koster lejligheden om måneden?",
        acceptedAnswers: [
          "7.500 kr.",
          "7500 kr.",
          "7.500 kroner",
          "7500 kroner",
          "Den koster 7.500 kr. om måneden",
          "7.500",
          "7500",
        ],
        hint: "Look for 'kr./md.'",
        explanation:
          "7.500 kr. per month, plus 'forbrug' — the heating, water and electricity are charged separately.",
      },
      {
        id: "rd-beskeder-5",
        kind: "free_production",
        instruction: "Reply to Lise's message. Say yes, and ask one question about the meeting.",
        prompt: "Skriv et kort svar til Lise.",
        checklist: [
          "Starts with 'Hej Lise'",
          "Says yes to taking the meeting",
          "Asks one question",
          "Ends with 'Hilsen' and your name",
        ],
        modelAnswer:
          "Hej Lise\nDet er helt fint, jeg tager mødet. Hvem kommer til mødet? God bedring!\nHilsen Omar",
      },
    ],
  },
  // -------------------------------------------------------------------
  // Level 3 — Chapter 9. The past tense, met in the wild. Also the first
  // text with subordinate clauses, because you cannot tell a story about
  // last weekend without saying why you did things.
  // -------------------------------------------------------------------
  {
    slug: "reading-min-weekend",
    title: "Reading: My weekend",
    danishName: "Min weekend",
    kind: "reading",
    tier: 2,
    constructCodes: ["past-tense", "subordinate-clauses"],
    pd3Modules: [2, 3],
    summary:
      "Everything in this text has already happened. The verbs have changed shape, the sentences are longer, and 'fordi' and 'da' start showing up — because a weekend is a story, and a story needs reasons.",
    primer:
      "You already know 'jeg arbejder'. This text is full of 'jeg arbejdede' — the same verb, moved into the past. Most Danish verbs do this by adding -ede or -te. A handful change their vowel instead, and those are the ones worth clicking on.",
    learningObjectives: [
      "Read a connected account of something that already happened",
      "Recognise regular past tense (-ede, -te) and the common irregular ones",
      "Follow a sentence that gives a reason with 'fordi'",
    ],
    canDo: "Understand somebody telling you about their weekend, and tell them about yours.",
    sections: [
      {
        heading: "Before you read",
        body: "Sara describes last weekend. Read it once for the story — what did she do, and did she enjoy it? Then read it again and look at the verbs. Every single one has an ending you have not used yet.",
      },
      {
        heading: "The one thing that trips people up",
        body: "In a 'fordi' clause, 'ikke' moves in front of the verb: 'fordi jeg ikke havde tid'. In a normal main clause it would be 'jeg havde ikke tid'. Same words, different order, and the trigger is 'fordi'.",
      },
    ],
    pitfalls: [
      "'var' is the past of 'er' (was), not a separate word to memorise on its own.",
      "'gik' is the past of 'gå'. The vowel changes; there is no -ede to look for.",
      "'i weekenden' means 'at the weekend'. 'i sidste weekend' is 'last weekend'.",
      "'hyggeligt' has no English equivalent. 'Nice' is the closest, but it means something closer to warm, easy and unhurried.",
    ],
    texts: [
      {
        id: "rt-min-weekend",
        title: "My weekend",
        danishTitle: "Min weekend",
        genre: "daily_life",
        level: 3,
        summary:
          "Sara had a good weekend. On Saturday she slept late, went to the market with a friend and cooked in the afternoon; friends came for dinner and stayed until midnight. On Sunday it rained, so she stayed in, read and did her homework. She did not get to the cinema because she did not have time, but she is going next weekend.",
        focusConstructs: ["past-tense", "subordinate-clauses"],
        paragraphs: [
          {
            translation:
              "Saturday: a late start, the market with Amina, cooking in the afternoon and friends for dinner.",
            sentences: [
              {
                danish: "I sidste weekend havde jeg fri.",
                english: "Last weekend I was off work.",
                structureNote:
                  "'I sidste weekend' comes first, so the verb 'havde' is second and 'jeg' third. 'havde' is the past of 'at have'. 'have fri' = be off work.",
                constructCodes: ["past-tense"],
              },
              {
                danish: "Lørdag sov jeg længe.",
                english: "On Saturday I slept late.",
                structureNote:
                  "'sov' is the past of 'at sove' — an irregular one, with a vowel change instead of an ending. 'sove længe' = sleep in.",
                constructCodes: ["past-tense"],
              },
              {
                danish: "Bagefter gik jeg på marked med min veninde Amina.",
                english: "Afterwards I went to the market with my friend Amina.",
                structureNote:
                  "'gik' is the past of 'at gå' — another vowel change. 'veninde' is a female friend; a male friend is 'ven'.",
                constructCodes: ["past-tense"],
              },
              {
                danish: "Vi købte grøntsager og friskt brød.",
                english: "We bought vegetables and fresh bread.",
                structureNote:
                  "'købte' is the past of 'at købe', formed with -te. 'friskt' has a -t because 'brød' is an et-word.",
                constructCodes: ["past-tense", "adjective-agreement"],
              },
              {
                danish: "Om eftermiddagen lavede jeg mad, fordi vi havde gæster om aftenen.",
                english: "In the afternoon I cooked, because we had guests in the evening.",
                structureNote:
                  "Two clauses. The first inverts after 'Om eftermiddagen'; 'fordi' then opens a subordinate clause giving the reason. 'lavede' is the regular -ede past.",
                constructCodes: ["past-tense", "subordinate-clauses"],
              },
              {
                danish: "Mine venner blev til midnat, og det var meget hyggeligt.",
                english: "My friends stayed until midnight, and it was very nice.",
                structureNote:
                  "'blev' is the past of 'at blive' (stay/become). 'var' is the past of 'at være'.",
                constructCodes: ["past-tense"],
              },
            ],
          },
          {
            translation:
              "Sunday: rain, so she stayed in with a book and her homework — and the cinema that did not happen.",
            sentences: [
              {
                danish: "Søndag regnede det hele dagen.",
                english: "On Sunday it rained all day.",
                structureNote:
                  "'regnede' — regular -ede past. Danish uses 'det' for the weather, exactly as English uses 'it'.",
                constructCodes: ["past-tense"],
              },
              {
                danish: "Derfor blev jeg hjemme.",
                english: "So I stayed at home.",
                structureNote:
                  "'Derfor' (therefore) takes position 1, so the subject moves behind the verb. 'hjemme' is 'at home' as a place; 'hjem' would be 'homewards'.",
                constructCodes: ["connectors"],
              },
              {
                danish: "Jeg læste en bog og lavede mine lektier.",
                english: "I read a book and did my homework.",
                structureNote:
                  "'læste' is the -te past of 'at læse'. The second verb shares the subject 'jeg' and does not repeat it.",
                constructCodes: ["past-tense", "coordination"],
              },
              {
                danish: "Jeg ville gerne i biografen, men jeg nåede det ikke, fordi jeg ikke havde tid.",
                english: "I wanted to go to the cinema, but I did not manage it, because I did not have time.",
                structureNote:
                  "Look at the two 'ikke'. In the main clause: 'jeg nåede det ikke' — after the verb. In the 'fordi' clause: 'jeg ikke havde tid' — before it. That flip is what 'fordi' does.",
                constructCodes: ["past-tense", "subordinate-clauses"],
              },
              {
                danish: "Men jeg skal i biografen næste weekend.",
                english: "But I am going to the cinema next weekend.",
                structureNote:
                  "Back to the present. 'skal i biografen' with no second verb — Danish leaves out 'gå' when the direction is obvious.",
                constructCodes: ["future-tense"],
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "at have fri", english: "to be off work" },
          { danish: "at sove længe", english: "to sleep in / sleep late" },
          { danish: "en veninde", english: "a female friend" },
          { danish: "grøntsager", english: "vegetables" },
          { danish: "gæster", english: "guests" },
          { danish: "hyggeligt", english: "nice / cosy / pleasant" },
          { danish: "hjemme", english: "at home" },
          { danish: "at nå", english: "to manage / to make it" },
        ],
        glossary: [
          { surface: "havde", lemma: "have", englishGloss: "had", partOfSpeech: "verb", inflectionNote: "Past tense of 'at have'. Irregular: har (present) → havde (past). 'have fri' = be off work." },
          { surface: "fri", lemma: "fri", englishGloss: "free / off", partOfSpeech: "adjective", inflectionNote: "In 'have fri' it means to be off work or off school." },
          { surface: "sov", lemma: "sove", englishGloss: "slept", partOfSpeech: "verb", inflectionNote: "Past tense of 'at sove'. Irregular — the vowel changes (sover → sov) and there is no ending." },
          { surface: "længe", lemma: "længe", englishGloss: "a long time / late", partOfSpeech: "adverb", inflectionNote: "'sove længe' means sleep in, not 'sleep for a long time' in general." },
          { surface: "gik", lemma: "gå", englishGloss: "went", partOfSpeech: "verb", inflectionNote: "Past tense of 'at gå'. Irregular: går → gik." },
          { surface: "veninde", lemma: "veninde", englishGloss: "friend (female)", partOfSpeech: "noun", inflectionNote: "Common gender: en veninde / veninden. Danish distinguishes 'ven' (male friend) from 'veninde' (female friend)." },
          { surface: "købte", lemma: "købe", englishGloss: "bought", partOfSpeech: "verb", inflectionNote: "Past tense of 'at købe', formed with -te. Verbs whose stem ends in a consonant cluster usually take -te rather than -ede." },
          { surface: "grøntsager", lemma: "grøntsag", englishGloss: "vegetables", partOfSpeech: "noun", inflectionNote: "Plural of 'grøntsag'. Almost always used in the plural." },
          { surface: "friskt", lemma: "frisk", englishGloss: "fresh", partOfSpeech: "adjective", inflectionNote: "Neuter form (+t) agreeing with the et-word 'brød'. With an en-word it would be 'frisk'." },
          { surface: "lavede", lemma: "lave", englishGloss: "made / cooked", partOfSpeech: "verb", inflectionNote: "Past tense of 'at lave', the regular -ede pattern. This is the ending most Danish verbs take." },
          { surface: "fordi", lemma: "fordi", englishGloss: "because", partOfSpeech: "conjunction", inflectionNote: "Opens a subordinate clause giving a reason. Inside it, 'ikke' moves in front of the verb — the single most useful thing to know about 'fordi'." },
          { surface: "gæster", lemma: "gæst", englishGloss: "guests", partOfSpeech: "noun", inflectionNote: "Plural of 'gæst': en gæst → gæster → gæsterne." },
          { surface: "blev", lemma: "blive", englishGloss: "stayed", partOfSpeech: "verb", inflectionNote: "Past tense of 'at blive'. The verb means both 'stay' and 'become', and also builds the passive — context decides." },
          { surface: "var", lemma: "være", englishGloss: "was", partOfSpeech: "verb", inflectionNote: "Past tense of 'at være'. Irregular: er → var." },
          { surface: "hyggeligt", lemma: "hyggelig", englishGloss: "nice / cosy", partOfSpeech: "adjective", inflectionNote: "Neuter form (+t) agreeing with 'det'. There is no real English equivalent — it describes warm, easy, unhurried company." },
          { surface: "regnede", lemma: "regne", englishGloss: "rained", partOfSpeech: "verb", inflectionNote: "Past tense of 'at regne', regular -ede. Weather takes 'det': det regner, det regnede." },
          { surface: "Derfor", lemma: "derfor", englishGloss: "therefore / so", partOfSpeech: "adverb", inflectionNote: "Starting a sentence with it pushes the subject behind the verb: 'Derfor blev jeg', not 'Derfor jeg blev'." },
          { surface: "hjemme", lemma: "hjemme", englishGloss: "at home", partOfSpeech: "adverb", inflectionNote: "A place, not a direction. 'Jeg er hjemme' = I am at home; 'Jeg går hjem' = I am going home." },
          { surface: "læste", lemma: "læse", englishGloss: "read", partOfSpeech: "verb", inflectionNote: "Past tense of 'at læse', formed with -te." },
          { surface: "ville", lemma: "ville", englishGloss: "wanted to", partOfSpeech: "verb", inflectionNote: "Past tense of the modal 'at ville'. 'ville gerne' = would have liked to." },
          { surface: "biografen", lemma: "biograf", englishGloss: "the cinema", partOfSpeech: "noun", inflectionNote: "Definite singular: biograf → biografen. Danish says 'i biografen' (in the cinema) where English says 'to the cinema'." },
          { surface: "nåede", lemma: "nå", englishGloss: "managed / made it", partOfSpeech: "verb", inflectionNote: "Past tense of 'at nå', regular -ede. 'Jeg nåede det ikke' = I did not get round to it." },
          { surface: "weekend", lemma: "weekend", englishGloss: "weekend", partOfSpeech: "noun", inflectionNote: "Common gender, borrowed from English: en weekend / weekenden. 'i weekenden' = at the weekend." },
          { surface: "sidste", lemma: "sidst", englishGloss: "last", partOfSpeech: "adjective", inflectionNote: "Definite form. 'i sidste weekend' = last weekend; 'til sidst' = finally." },
          { surface: "Lørdag", lemma: "lørdag", englishGloss: "Saturday", partOfSpeech: "noun", inflectionNote: "No article and no capital in the middle of a sentence. On its own at the front it simply means 'on Saturday'." },
          { surface: "Søndag", lemma: "søndag", englishGloss: "Sunday", partOfSpeech: "noun", inflectionNote: "Same pattern as the other weekdays." },
          { surface: "Bagefter", lemma: "bagefter", englishGloss: "afterwards", partOfSpeech: "adverb", inflectionNote: "Starting a clause with it pushes the subject behind the verb: 'Bagefter gik jeg'." },
          { surface: "marked", lemma: "marked", englishGloss: "market", partOfSpeech: "noun", inflectionNote: "Neuter: et marked / markedet. 'på marked' with no article is the normal way to say you are going to one." },
          { surface: "eftermiddagen", lemma: "eftermiddag", englishGloss: "the afternoon", partOfSpeech: "noun", inflectionNote: "Definite singular. 'Om eftermiddagen' = in the afternoon, as a habit." },
          { surface: "aftenen", lemma: "aften", englishGloss: "the evening", partOfSpeech: "noun", inflectionNote: "Definite singular. 'om aftenen' = in the evening." },
          { surface: "venner", lemma: "ven", englishGloss: "friends", partOfSpeech: "noun", inflectionNote: "Plural of 'ven'. A female friend on her own is 'veninde'." },
          { surface: "midnat", lemma: "midnat", englishGloss: "midnight", partOfSpeech: "noun", inflectionNote: "Common gender, normally used without an article: 'til midnat' = until midnight." },
          { surface: "lektier", lemma: "lektie", englishGloss: "homework", partOfSpeech: "noun", inflectionNote: "Plural of 'lektie', and almost always used in the plural." },
          { surface: "gerne", lemma: "gerne", englishGloss: "gladly / would like", partOfSpeech: "adverb", inflectionNote: "Rarely translated on its own. 'ville gerne' = would like to; 'kan godt lide' uses 'godt' the same way." },
          { surface: "næste", lemma: "næste", englishGloss: "next", partOfSpeech: "adjective", inflectionNote: "Does not change: næste uge, næste weekend, næste gang." },
        ],
      },
    ],
    exercises: [
      {
        id: "rd-weekend-1",
        kind: "recognition",
        instruction: "Which word makes the second half of this sentence a reason?",
        sentence: "Jeg blev hjemme fordi det regnede hele dagen",
        answerIndex: 3,
        explanation:
          "'fordi'. It is the word that turns what follows into an explanation — and that changes the word order inside it.",
      },
      {
        id: "rd-weekend-2",
        kind: "selection",
        instruction: "Complete with the past tense.",
        sentence: "Om eftermiddagen ___ jeg mad.",
        options: ["lavede", "laver", "lave"],
        answer: "lavede",
        explanation:
          "'lave' is a regular verb, so the past adds -ede: lave → lavede. 'laver' would be the present.",
      },
      {
        id: "rd-weekend-3",
        kind: "matching",
        instruction: "Match each present-tense verb to its past tense in the text.",
        pairs: [
          { left: "har", right: "havde" },
          { left: "sover", right: "sov" },
          { left: "går", right: "gik" },
          { left: "er", right: "var" },
          { left: "laver", right: "lavede" },
        ],
        explanation:
          "'laver → lavede' is the regular pattern. The other four change their vowel instead — those are the irregular verbs, and they are also the most common ones.",
      },
      {
        id: "rd-weekend-4",
        kind: "ordering",
        instruction: "Build the reason clause: 'because I did not have time'.",
        scrambled: ["tid", "jeg", "havde", "fordi", "ikke"],
        answer: ["fordi", "jeg", "ikke", "havde", "tid"],
        explanation:
          "After 'fordi' the clause is subordinate, so 'ikke' goes in front of the verb: 'fordi jeg ikke havde tid'. As a main clause on its own it would be 'jeg havde ikke tid'.",
      },
      {
        id: "rd-weekend-5",
        kind: "controlled_production",
        instruction: "Answer in Danish, in the past tense: Hvad lavede Sara om søndagen?",
        prompt: "Hvad lavede Sara om søndagen?",
        acceptedAnswers: [
          "Hun blev hjemme",
          "Hun blev hjemme.",
          "Hun læste en bog",
          "Hun læste en bog og lavede sine lektier",
          "Hun blev hjemme og læste en bog",
        ],
        hint: "Use a past-tense verb: blev, læste or lavede.",
        explanation:
          "'Hun blev hjemme og læste en bog.' Any of the past-tense answers is fine — the point is that the verb has moved into the past.",
      },
      {
        id: "rd-weekend-6",
        kind: "free_production",
        instruction: "Write four sentences about your own last weekend, in the past tense.",
        prompt: "Skriv om din sidste weekend. Hvad lavede du lørdag? Hvad lavede du søndag?",
        checklist: [
          "At least four sentences",
          "Every verb in the past tense",
          "One sentence with 'fordi' giving a reason",
          "Says whether it was good or not",
        ],
        modelAnswer:
          "I sidste weekend var jeg hjemme. Lørdag stod jeg sent op og læste en bog. Om eftermiddagen gik jeg en tur i parken med min familie. Søndag lavede jeg mad til hele ugen, fordi jeg ikke har tid om aftenen. Det var en stille weekend, men den var god.",
      },
      {
        id: "rd-weekend-7",
        kind: "communication",
        instruction: "Tell somebody about your weekend out loud. Use the past tense throughout.",
        prompt: "Fortæl om din sidste weekend. Hvad lavede du? Hvem var du sammen med? Var det en god weekend?",
        demand: "experience",
        usefulPhrases: [
          "I sidste weekend ...",
          "Lørdag ... / Søndag ...",
          "Jeg var sammen med ...",
          "Det var rigtig hyggeligt.",
          "... fordi jeg ikke havde tid.",
        ],
      },
    ],
  },
  // -------------------------------------------------------------------
  // Level 5 — Chapter 13. PD3 territory: an opinion, held for reasons, with
  // a concession in it. Danish-first, so the English does not appear until
  // the learner asks for it.
  // -------------------------------------------------------------------
  {
    slug: "reading-derfor-blev-jeg-i-danmark",
    title: "Reading: Why I stayed in Denmark",
    danishName: "Derfor blev jeg i Danmark",
    kind: "reading",
    tier: 3,
    constructCodes: ["connectors", "subordinate-clauses", "multiple-subordinate-clauses"],
    pd3Modules: [3, 4, 5],
    summary:
      "The kind of text PD3 actually asks you to read: somebody explaining a decision, giving reasons, admitting the other side, and reaching a conclusion. Long sentences with several clauses, and connectors doing real work.",
    primer:
      "Read this one in Danish first. The English is there, but do not open it until you have been through the text once — at this level the skill being tested is getting the sense without translating.",
    learningObjectives: [
      "Follow an argument across several paragraphs",
      "Recognise what 'selvom', 'derfor' and 'til gengæld' are doing to the argument",
      "Read a sentence with more than one subordinate clause without losing the thread",
    ],
    canDo: "Read a personal account that gives reasons and weighs two sides, and say what the writer concluded.",
    sections: [
      {
        heading: "Before you read",
        body: "Yusuf came to Denmark for two years and is still here eleven years later. He explains why. Read for the shape of the argument first: what was hard, what changed, and what he decided.",
      },
      {
        heading: "The words that carry the argument",
        body: "'selvom' concedes (even though), 'derfor' concludes (that is why), 'til gengæld' balances (on the other hand). These three carry more meaning than any noun in the text — if you know what they are doing, you know what the writer thinks.",
      },
    ],
    pitfalls: [
      "'selvom' opens a subordinate clause, so 'ikke' goes in front of the verb inside it.",
      "'til gengæld' is not 'in return' here — it introduces the compensating good side of something.",
      "'savne' means to miss somebody or something. 'Jeg savner min familie' — not 'mangler', which means something is absent or lacking.",
      "'egentlig' softens a statement: 'actually', 'when it comes down to it'. It rarely translates as a single word.",
    ],
    texts: [
      {
        id: "rt-derfor-blev-jeg",
        title: "Why I stayed in Denmark",
        danishTitle: "Derfor blev jeg i Danmark",
        genre: "article",
        level: 5,
        summary:
          "Yusuf came to Denmark eleven years ago intending to stay two years, study and go home. The first years were hard: he did not speak the language, the winters were dark and he felt outside everything. What changed was work — a job where colleagues talked to him and expected him to answer in Danish, which taught him more than any course. He admits he still misses his family and that some things about Denmark he has never grown used to, but he has built a life here, his children are Danish, and he no longer thinks of going home as going somewhere else. He concludes that he did not decide to stay; he simply stopped deciding to leave.",
        focusConstructs: ["connectors", "subordinate-clauses", "multiple-subordinate-clauses"],
        paragraphs: [
          {
            translation:
              "He arrived eleven years ago meaning to stay two years, and the first years were much harder than he had expected.",
            sentences: [
              {
                danish: "Da jeg kom til Danmark for elleve år siden, troede jeg, at jeg skulle blive i to år.",
                english: "When I came to Denmark eleven years ago, I thought I would stay for two years.",
                structureNote:
                  "Three clauses. 'Da ...' is subordinate and comes first, which is why the main clause starts with its verb: 'troede jeg'. Then 'at' opens a third clause.",
                constructCodes: ["multiple-subordinate-clauses", "past-tense"],
              },
              {
                danish: "Jeg ville læse, tage min uddannelse med hjem og starte noget op der.",
                english: "I wanted to study, take my education home with me and start something there.",
                structureNote:
                  "One modal, three infinitives sharing it: 'ville læse, tage ... og starte'. Danish does not repeat the modal.",
              },
              {
                danish: "De første år var svære, fordi jeg ikke kunne sproget.",
                english: "The first years were hard, because I could not speak the language.",
                structureNote:
                  "'fordi' opens the reason, and inside it 'ikke' sits in front of 'kunne'. 'kunne sproget' — Danish says you 'can' a language.",
                constructCodes: ["subordinate-clauses"],
              },
              {
                danish: "Vintrene var mørke, og jeg følte mig udenfor det hele.",
                english: "The winters were dark, and I felt outside all of it.",
                structureNote:
                  "'følte mig' — a reflexive verb: you feel yourself something. The pronoun is not optional.",
              },
            ],
          },
          {
            translation:
              "What changed was a job, where people talked to him and expected Danish back — which taught him more than the classroom had.",
            sentences: [
              {
                danish: "Det, der ændrede noget, var et arbejde.",
                english: "What changed things was a job.",
                structureNote:
                  "'Det, der ...' = 'the thing that ...'. A relative clause used as the subject of the sentence.",
              },
              {
                danish: "Jeg fik job på et lager, hvor mine kolleger snakkede med mig hele dagen.",
                english: "I got a job at a warehouse, where my colleagues talked to me all day.",
                structureNote:
                  "'hvor' opens a relative clause describing the workplace.",
                constructCodes: ["subordinate-clauses"],
              },
              {
                danish: "De forventede, at jeg svarede på dansk, selvom jeg svarede dårligt.",
                english: "They expected me to answer in Danish, even though I answered badly.",
                structureNote:
                  "'at' opens what they expected; 'selvom' then concedes. Two subordinate clauses hanging off one main clause.",
                constructCodes: ["multiple-subordinate-clauses", "connectors"],
              },
              {
                danish: "Det lærte mig mere på et halvt år, end sprogskolen kunne på to.",
                english: "That taught me more in six months than the language school could in two years.",
                structureNote:
                  "'mere ... end ...' is the comparison. The second half leaves out 'lære mig' because it is obvious.",
              },
            ],
          },
          {
            translation:
              "He is honest about what is still hard, but weighs it against what he has built here.",
            sentences: [
              {
                danish: "Jeg vil ikke sige, at alt er let.",
                english: "I would not say that everything is easy.",
                structureNote:
                  "Main clause with 'ikke' after the verb, then 'at' opening what he will not say.",
              },
              {
                danish: "Jeg savner stadig min familie, og der er ting ved Danmark, som jeg aldrig er blevet vant til.",
                english: "I still miss my family, and there are things about Denmark I have never got used to.",
                structureNote:
                  "'som' opens a relative clause, and inside it 'aldrig' comes before the verb — the same rule as 'ikke' in a subordinate clause.",
                constructCodes: ["subordinate-clauses"],
              },
              {
                danish: "Til gengæld har jeg fået et liv her, som jeg ikke havde regnet med.",
                english: "On the other hand, I have got a life here that I had not counted on.",
                structureNote:
                  "'Til gengæld' first, so the verb 'har' is second. It balances the sentence before it: here is the other side.",
                constructCodes: ["connectors"],
              },
              {
                danish: "Mine børn er danske, og de taler dansk med hinanden derhjemme.",
                english: "My children are Danish, and they speak Danish with each other at home.",
                structureNote: "'hinanden' = each other. 'derhjemme' = at home, in our home.",
              },
            ],
          },
          {
            translation: "His conclusion, and the distinction it rests on.",
            sentences: [
              {
                danish: "Derfor tænker jeg ikke længere på at rejse hjem som at rejse et andet sted hen.",
                english: "That is why I no longer think of going home as going somewhere else.",
                structureNote:
                  "'Derfor' first, so 'tænker jeg'. 'ikke længere' = no longer. 'at rejse' as a noun: the act of travelling.",
                constructCodes: ["connectors"],
              },
              {
                danish: "Egentlig besluttede jeg aldrig at blive.",
                english: "I never actually decided to stay.",
                structureNote:
                  "'Egentlig' first, so 'besluttede jeg'. The word softens the whole sentence — 'when it comes down to it'.",
              },
              {
                danish: "Jeg holdt bare op med at beslutte at rejse.",
                english: "I just stopped deciding to leave.",
                structureNote:
                  "'holde op med at' = stop doing something. The last word of the text is the point of the whole thing.",
              },
            ],
          },
        ],
        keyVocabulary: [
          { danish: "selvom", english: "even though" },
          { danish: "til gengæld", english: "on the other hand / in return" },
          { danish: "derfor", english: "that is why / therefore" },
          { danish: "egentlig", english: "actually / when it comes down to it" },
          { danish: "at savne", english: "to miss (somebody)" },
          { danish: "at forvente", english: "to expect" },
          { danish: "at blive vant til", english: "to get used to" },
          { danish: "at holde op med", english: "to stop (doing something)" },
        ],
        glossary: [
          { surface: "Da", lemma: "da", englishGloss: "when", partOfSpeech: "conjunction", inflectionNote: "Used for a single event in the past. 'Når' is for something repeated or in the future — this is the distinction PD3 expects you to get right." },
          { surface: "troede", lemma: "tro", englishGloss: "thought / believed", partOfSpeech: "verb", inflectionNote: "Past tense of 'at tro'. Irregular: tror → troede." },
          { surface: "skulle", lemma: "skulle", englishGloss: "would / was going to", partOfSpeech: "verb", inflectionNote: "Past tense of the modal 'at skulle'. Used here for a plan held in the past." },
          { surface: "uddannelse", lemma: "uddannelse", englishGloss: "education / qualification", partOfSpeech: "noun", inflectionNote: "Common gender: en uddannelse / uddannelsen. Also the word in 'Danskuddannelse'." },
          { surface: "svære", lemma: "svær", englishGloss: "hard / difficult", partOfSpeech: "adjective", inflectionNote: "Plural form (-e) agreeing with 'de første år'. Singular common gender would be 'svær', neuter 'svært'." },
          { surface: "kunne", lemma: "kunne", englishGloss: "could (speak)", partOfSpeech: "verb", inflectionNote: "Past of 'at kunne'. 'kunne sproget' — in Danish you 'can' a language rather than speaking it." },
          { surface: "Vintrene", lemma: "vinter", englishGloss: "the winters", partOfSpeech: "noun", inflectionNote: "Definite plural: vinter → vintre → vintrene. The -e- drops out in the plural." },
          { surface: "følte", lemma: "føle", englishGloss: "felt", partOfSpeech: "verb", inflectionNote: "Past of 'at føle'. Reflexive here: 'føle sig' + adjective = to feel a certain way." },
          { surface: "udenfor", lemma: "udenfor", englishGloss: "outside", partOfSpeech: "adverb", inflectionNote: "One word when it means 'on the outside' as a state, as here. Two words ('uden for') when it means physically outside something." },
          { surface: "ændrede", lemma: "ændre", englishGloss: "changed", partOfSpeech: "verb", inflectionNote: "Past of 'at ændre', regular -ede." },
          { surface: "kolleger", lemma: "kollega", englishGloss: "colleagues", partOfSpeech: "noun", inflectionNote: "Plural of 'kollega': en kollega → kolleger → kollegerne." },
          { surface: "forventede", lemma: "forvente", englishGloss: "expected", partOfSpeech: "verb", inflectionNote: "Past of 'at forvente', regular -ede." },
          { surface: "selvom", lemma: "selvom", englishGloss: "even though", partOfSpeech: "conjunction", inflectionNote: "Concedes a point: it admits something that works against what you just said. Opens a subordinate clause, so 'ikke' would go before the verb." },
          { surface: "savner", lemma: "savne", englishGloss: "miss", partOfSpeech: "verb", inflectionNote: "Present of 'at savne' — to miss somebody. Not 'mangle', which means something is lacking." },
          { surface: "stadig", lemma: "stadig", englishGloss: "still", partOfSpeech: "adverb", inflectionNote: "Does not change. Sits after the verb in a main clause." },
          { surface: "som", lemma: "som", englishGloss: "that / which", partOfSpeech: "pronoun", inflectionNote: "Relative pronoun, opening a clause that describes the noun before it. Inside that clause 'ikke' and 'aldrig' come before the verb." },
          { surface: "vant", lemma: "vant", englishGloss: "used (to)", partOfSpeech: "adjective", inflectionNote: "Only appears in 'vant til' = used to. 'blive vant til' = to get used to." },
          { surface: "gengæld", lemma: "gengæld", englishGloss: "return", partOfSpeech: "noun", inflectionNote: "Only really used in 'til gengæld', which balances a sentence: here is the compensating other side." },
          { surface: "regnet", lemma: "regne", englishGloss: "counted / reckoned", partOfSpeech: "verb", inflectionNote: "Participle in 'havde regnet med' = had counted on. Nothing to do with rain, despite being the same verb." },
          { surface: "hinanden", lemma: "hinanden", englishGloss: "each other", partOfSpeech: "pronoun", inflectionNote: "Does not change. Used when two or more people do something to one another." },
          { surface: "Derfor", lemma: "derfor", englishGloss: "that is why", partOfSpeech: "adverb", inflectionNote: "Draws a conclusion from what came before. First in the sentence, so the subject moves behind the verb." },
          { surface: "Egentlig", lemma: "egentlig", englishGloss: "actually", partOfSpeech: "adverb", inflectionNote: "Softens the statement it opens — 'when it comes down to it'. Very common in spoken Danish and hard to translate as one word." },
          { surface: "besluttede", lemma: "beslutte", englishGloss: "decided", partOfSpeech: "verb", inflectionNote: "Past of 'at beslutte', regular -ede." },
          { surface: "holdt", lemma: "holde", englishGloss: "stopped", partOfSpeech: "verb", inflectionNote: "Past of 'at holde'. In 'holde op med at' the whole phrase means 'stop doing something'." },
        ],
      },
    ],
    exercises: [
      {
        id: "rd-danmark-1",
        kind: "selection",
        instruction: "Complete the concession from the text.",
        sentence: "De forventede, at jeg svarede på dansk, ___ jeg svarede dårligt.",
        options: ["selvom", "fordi", "derfor"],
        answer: "selvom",
        explanation:
          "'selvom' — answering badly works against the expectation, and 'selvom' is the word that admits that. 'fordi' would make it the reason, which is the opposite.",
      },
      {
        id: "rd-danmark-2",
        kind: "matching",
        instruction: "Match each connector to the job it does in the argument.",
        pairs: [
          { left: "selvom", right: "admits something against the point" },
          { left: "derfor", right: "draws a conclusion" },
          { left: "til gengæld", right: "gives the other, better side" },
          { left: "fordi", right: "gives a reason" },
        ],
        explanation:
          "At PD3 level these four words carry the argument. Get them right and you can follow a text even where the vocabulary defeats you.",
      },
      {
        id: "rd-danmark-3",
        kind: "ordering",
        instruction: "Build: 'On the other hand I have got a life here.'",
        scrambled: ["fået", "gengæld", "et", "Til", "har", "liv", "jeg", "her"],
        answer: ["Til", "gengæld", "har", "jeg", "fået", "et", "liv", "her"],
        explanation:
          "'Til gengæld' fills position 1, so the finite verb 'har' comes second and 'jeg' third. The participle 'fået' waits until after the subject.",
      },
      {
        id: "rd-danmark-4",
        kind: "controlled_production",
        instruction: "In Danish: what does Yusuf say actually changed things for him?",
        prompt: "Hvad ændrede noget for Yusuf?",
        acceptedAnswers: [
          "Et arbejde",
          "Et arbejde.",
          "Et job",
          "Hans arbejde",
          "Et arbejde på et lager",
          "Arbejdet",
        ],
        hint: "One noun is enough.",
        explanation:
          "'Et arbejde.' Not the language school — his point is that the job taught him more in six months than the school did in two years.",
      },
      {
        id: "rd-danmark-5",
        kind: "free_production",
        instruction:
          "Write a short paragraph about a decision you have made. Give one reason, and admit one thing that works against it.",
        prompt:
          "Skriv om en beslutning, du har taget. Hvorfor tog du den? Hvad er svært ved den?",
        checklist: [
          "At least four sentences",
          "One 'fordi' clause giving a reason",
          "One 'selvom' clause admitting the other side",
          "A conclusion, perhaps with 'derfor'",
        ],
        modelAnswer:
          "For tre år siden besluttede jeg at skifte arbejde. Jeg gjorde det, fordi jeg ikke lærte noget nyt på mit gamle job. Selvom jeg tjener lidt mindre nu, er jeg meget mere glad om morgenen. Til gengæld har jeg længere til arbejde, og det er hårdt om vinteren. Men jeg fortryder det ikke, og derfor bliver jeg, hvor jeg er.",
      },
      {
        id: "rd-danmark-6",
        kind: "communication",
        instruction:
          "Answer out loud, the way you would in a PD3 oral: give an opinion and back it up.",
        prompt:
          "Er det svært at lære et nyt sprog som voksen? Hvorfor eller hvorfor ikke? Giv et eksempel fra dit eget liv.",
        demand: "reasoning",
        usefulPhrases: [
          "Jeg synes, at ...",
          "Det er svært, fordi ...",
          "Selvom ..., så ...",
          "Til gengæld ...",
          "Et eksempel fra mit eget liv er ...",
          "Derfor mener jeg, at ...",
        ],
      },
    ],
  },
];
