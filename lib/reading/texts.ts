import type { LearningText } from "@/types";

// Library-only Danish texts.
//
// Written to be read, not to be examined. That is the difference between these
// and the texts inside the grammar course: a course text exists to show a rule
// working, so it is full of that rule on purpose. These exist because reading
// a lot of Danish you can nearly understand is how reading gets easier, so
// they are simply about something.
//
// Every text carries a translation for each sentence and paragraph and a
// glossary of the words worth explaining. That is not decoration: it is what
// lets a learner click a word and get an answer instantly, offline and free,
// instead of waiting on a model (see lib/reading/explain.ts).
//
// Levels follow lib/learning/text.ts: 1 short main clauses · 2 connected
// sentences · 3 paragraphs and past tense · 4 natural everyday Danish · 5 PD3.

export const LIBRARY_TEXTS: LearningText[] = [
  // -------------------------------------------------------------------
  // Level 1 — a story, present tense, one clause at a time.
  // -------------------------------------------------------------------
  {
    id: "lib-en-dag-i-parken",
    title: "A day in the park",
    danishTitle: "En dag i parken",
    genre: "story",
    level: 1,
    summary:
      "It is Sunday and the sun is shining. Emil takes his dog Bobby to the park. Bobby runs after a ball and finds a small girl's lost red hat in the grass. The girl is happy and gives Bobby a biscuit. Emil and the girl's father talk on a bench while the children play, and Emil thinks it has been a good day.",
    focusConstructs: ["present-tense"],
    paragraphs: [
      {
        translation: "It is Sunday, the weather is good, and Emil takes his dog to the park.",
        sentences: [
          {
            danish: "Det er søndag.",
            english: "It is Sunday.",
            structureNote: "Danish uses 'det' for weather, days and times, the way English uses 'it'.",
          },
          {
            danish: "Solen skinner, og himlen er blå.",
            english: "The sun is shining, and the sky is blue.",
            structureNote:
              "Two small sentences joined by 'og'. 'Solen' and 'himlen' both have the 'the' stuck on the end.",
          },
          {
            danish: "Emil går i parken med sin hund.",
            english: "Emil goes to the park with his dog.",
            structureNote: "'sin' means 'his own' — it points back to Emil, the subject.",
          },
          {
            danish: "Hunden hedder Bobby.",
            english: "The dog is called Bobby.",
            structureNote: "'Hunden' = the dog. The article is the -en on the end.",
          },
        ],
      },
      {
        translation: "Bobby chases a ball and finds a red hat in the grass.",
        sentences: [
          {
            danish: "Bobby er glad.",
            english: "Bobby is happy.",
            structureNote: "Subject, verb, adjective. The simplest shape there is.",
          },
          {
            danish: "Han løber efter en bold.",
            english: "He runs after a ball.",
            structureNote: "'efter' = after. Danish uses 'han' for animals people are fond of.",
          },
          {
            danish: "Pludselig stopper han.",
            english: "Suddenly he stops.",
            structureNote:
              "'Pludselig' comes first, so the verb 'stopper' has to be second and 'han' lands third.",
          },
          {
            danish: "Der ligger en rød hue i græsset.",
            english: "There is a red hat lying in the grass.",
            structureNote:
              "'Der ligger ...' is how Danish says something is lying somewhere. English would just say 'there is'.",
          },
        ],
      },
      {
        translation: "A girl has lost the hat. Bobby brings it back and she gives him a biscuit.",
        sentences: [
          {
            danish: "En lille pige leder efter sin hue.",
            english: "A little girl is looking for her hat.",
            structureNote: "'lede efter' = look for. 'sin' again: her own hat.",
          },
          {
            danish: "Bobby tager huen i munden.",
            english: "Bobby takes the hat in his mouth.",
            structureNote:
              "'huen' and 'munden' both carry 'the' on the end. Danish does not say 'his mouth' here — it is obvious whose.",
          },
          {
            danish: "Han giver den til pigen.",
            english: "He gives it to the girl.",
            structureNote: "'den' replaces 'huen' — an en-word, so 'den' and not 'det'.",
          },
          {
            danish: "Pigen griner og siger tak.",
            english: "The girl laughs and says thank you.",
            structureNote: "One subject, two verbs joined by 'og'.",
          },
          {
            danish: "Hun giver Bobby en kiks.",
            english: "She gives Bobby a biscuit.",
            structureNote: "Two objects: who gets it (Bobby), then what (en kiks).",
          },
        ],
      },
      {
        translation: "Emil talks to the girl's father, and thinks it has been a good day.",
        sentences: [
          {
            danish: "Pigens far sidder på en bænk.",
            english: "The girl's father is sitting on a bench.",
            structureNote: "'Pigens' — the -s does the same job as the English apostrophe-s.",
          },
          {
            danish: "Emil sætter sig ned og snakker med ham.",
            english: "Emil sits down and talks with him.",
            structureNote:
              "'sætter sig' — you seat yourself. The 'sig' is not optional in Danish.",
          },
          {
            danish: "Børnene leger, og hundene sover.",
            english: "The children play, and the dogs sleep.",
            structureNote: "Two definite plurals: børnene, hundene.",
          },
          {
            danish: "Det er en god dag.",
            english: "It is a good day.",
            structureNote: "'god' agrees with the en-word 'dag'. With an et-word it would be 'godt'.",
          },
        ],
      },
    ],
    keyVocabulary: [
      { danish: "at skinne", english: "to shine" },
      { danish: "en hund", english: "a dog" },
      { danish: "at løbe efter", english: "to run after / chase" },
      { danish: "pludselig", english: "suddenly" },
      { danish: "en hue", english: "a hat (woolly)" },
      { danish: "at lede efter", english: "to look for" },
      { danish: "en bænk", english: "a bench" },
      { danish: "at lege", english: "to play (as children do)" },
    ],
    glossary: [
      { surface: "søndag", lemma: "søndag", englishGloss: "Sunday", partOfSpeech: "noun", inflectionNote: "Days of the week take no article and no capital letter in Danish: 'på søndag' = on Sunday." },
      { surface: "Solen", lemma: "sol", englishGloss: "the sun", partOfSpeech: "noun", inflectionNote: "Definite singular: sol → solen. Danish attaches 'the' to the end of the word." },
      { surface: "skinner", lemma: "skinne", englishGloss: "is shining", partOfSpeech: "verb", inflectionNote: "Present tense of 'at skinne'. Danish has no separate '-ing' form — 'skinner' covers both 'shines' and 'is shining'." },
      { surface: "himlen", lemma: "himmel", englishGloss: "the sky", partOfSpeech: "noun", inflectionNote: "Definite singular of 'himmel'. The second -m- drops out: himmel → himlen." },
      { surface: "blå", lemma: "blå", englishGloss: "blue", partOfSpeech: "adjective", inflectionNote: "Does not add -t in the neuter — a small group of adjectives ending in a vowel behave this way." },
      { surface: "parken", lemma: "park", englishGloss: "the park", partOfSpeech: "noun", inflectionNote: "Definite singular: park → parken. 'i parken' = in the park." },
      { surface: "sin", lemma: "sin", englishGloss: "his (own)", partOfSpeech: "pronoun", inflectionNote: "Points back to the subject of the sentence. 'Emil går med sin hund' = his own dog; 'hans hund' would mean somebody else's." },
      { surface: "hund", lemma: "hund", englishGloss: "dog", partOfSpeech: "noun", inflectionNote: "Common gender: en hund / hunden / hunde / hundene." },
      { surface: "Hunden", lemma: "hund", englishGloss: "the dog", partOfSpeech: "noun", inflectionNote: "Definite singular of 'hund'." },
      { surface: "glad", lemma: "glad", englishGloss: "happy", partOfSpeech: "adjective", inflectionNote: "Base form. Most adjectives add -t in the neuter, but 'glad' already ends in -d and does not: 'et glad barn'. The plural is 'glade'." },
      { surface: "løber", lemma: "løbe", englishGloss: "runs", partOfSpeech: "verb", inflectionNote: "Present tense of 'at løbe'. 'løbe efter' = run after, chase." },
      { surface: "bold", lemma: "bold", englishGloss: "ball", partOfSpeech: "noun", inflectionNote: "Common gender: en bold / bolden." },
      { surface: "Pludselig", lemma: "pludselig", englishGloss: "suddenly", partOfSpeech: "adverb", inflectionNote: "Putting it first pushes the subject behind the verb: 'Pludselig stopper han', not 'Pludselig han stopper'." },
      { surface: "stopper", lemma: "stoppe", englishGloss: "stops", partOfSpeech: "verb", inflectionNote: "Present tense of 'at stoppe'." },
      { surface: "ligger", lemma: "ligge", englishGloss: "is lying", partOfSpeech: "verb", inflectionNote: "Present of 'at ligge' — to lie flat. Danish is fussy about position: things ligger (lie), står (stand) or sidder (sit) somewhere." },
      { surface: "rød", lemma: "rød", englishGloss: "red", partOfSpeech: "adjective", inflectionNote: "Base form agreeing with the en-word 'hue'. With an et-word it would be 'rødt'." },
      { surface: "hue", lemma: "hue", englishGloss: "hat", partOfSpeech: "noun", inflectionNote: "Common gender: en hue / huen. A woolly or knitted hat specifically." },
      { surface: "græsset", lemma: "græs", englishGloss: "the grass", partOfSpeech: "noun", inflectionNote: "Definite singular of the et-word 'græs'. The -s doubles before the ending." },
      { surface: "lille", lemma: "lille", englishGloss: "little", partOfSpeech: "adjective", inflectionNote: "Irregular: 'lille' in the singular, 'små' in the plural. There is no 'lilles'." },
      { surface: "pige", lemma: "pige", englishGloss: "girl", partOfSpeech: "noun", inflectionNote: "Common gender: en pige / pigen / piger / pigerne." },
      { surface: "leder", lemma: "lede", englishGloss: "is looking", partOfSpeech: "verb", inflectionNote: "Present of 'at lede'. Only means 'look for' when followed by 'efter'." },
      { surface: "munden", lemma: "mund", englishGloss: "the mouth", partOfSpeech: "noun", inflectionNote: "Definite singular. Danish says 'i munden' where English says 'in his mouth' — whose it is, is obvious." },
      { surface: "giver", lemma: "give", englishGloss: "gives", partOfSpeech: "verb", inflectionNote: "Present of 'at give'." },
      { surface: "griner", lemma: "grine", englishGloss: "laughs", partOfSpeech: "verb", inflectionNote: "Present of 'at grine'." },
      { surface: "kiks", lemma: "kiks", englishGloss: "biscuit", partOfSpeech: "noun", inflectionNote: "Common gender, same form in the plural: en kiks, to kiks." },
      { surface: "Pigens", lemma: "pige", englishGloss: "the girl's", partOfSpeech: "noun", inflectionNote: "Possessive: add -s, exactly like the English apostrophe-s but with no apostrophe." },
      { surface: "far", lemma: "far", englishGloss: "father", partOfSpeech: "noun", inflectionNote: "Common gender: en far / faren / fædre. The everyday word; 'fader' is formal." },
      { surface: "bænk", lemma: "bænk", englishGloss: "bench", partOfSpeech: "noun", inflectionNote: "Common gender: en bænk / bænken." },
      { surface: "sætter", lemma: "sætte", englishGloss: "sits (down)", partOfSpeech: "verb", inflectionNote: "In 'sætte sig ned' you seat yourself. The 'sig' cannot be left out." },
      { surface: "snakker", lemma: "snakke", englishGloss: "talks", partOfSpeech: "verb", inflectionNote: "Present of 'at snakke' — the everyday word for chatting. 'tale' is a touch more formal." },
      { surface: "Børnene", lemma: "barn", englishGloss: "the children", partOfSpeech: "noun", inflectionNote: "Definite plural of 'barn': barn → børn → børnene. The vowel changes in the plural." },
      { surface: "leger", lemma: "lege", englishGloss: "play", partOfSpeech: "verb", inflectionNote: "Present of 'at lege' — play as children do. Playing an instrument or a sport is 'spille'." },
    ],
  },
  // -------------------------------------------------------------------
  // Level 2 — everyday Danish, the vocabulary of an ordinary errand.
  // -------------------------------------------------------------------
  {
    id: "lib-i-supermarkedet",
    title: "At the supermarket",
    danishTitle: "I supermarkedet",
    genre: "daily_life",
    level: 2,
    summary:
      "Nadia shops on Saturday mornings because the shop is quiet then. She writes a list but always forgets something. This time she forgets milk and has to go back. At the till she cannot find her card, and the woman behind her in the queue is patient about it. Nadia cycles home with two heavy bags and decides she will order online next time — though she says that every week.",
    paragraphs: [
      {
        translation: "Nadia shops early on Saturdays, with a list she does not entirely trust.",
        sentences: [
          {
            danish: "Jeg handler altid lørdag morgen.",
            english: "I always shop on Saturday mornings.",
            structureNote: "'handle' means to shop. 'lørdag morgen' needs no preposition.",
          },
          {
            danish: "Så er der ikke så mange mennesker i butikken.",
            english: "There are not so many people in the shop then.",
            structureNote:
              "'Så' comes first, so the verb 'er' is second. 'der er' = there is/are.",
          },
          {
            danish: "Jeg skriver altid en liste, men jeg glemmer altid noget.",
            english: "I always write a list, but I always forget something.",
            structureNote:
              "Two main clauses joined by 'men'. In both, 'altid' sits straight after the verb.",
          },
        ],
      },
      {
        translation: "She works through the shop, and discovers at the freezer that she has forgotten the milk.",
        sentences: [
          {
            danish: "Først går jeg hen til frugt og grønt.",
            english: "First I go over to the fruit and vegetables.",
            structureNote: "'Først' first, so 'går jeg'. 'hen til' = over to.",
          },
          {
            danish: "Jeg tager æbler, tomater og en pose gulerødder.",
            english: "I take apples, tomatoes and a bag of carrots.",
            structureNote: "A list joined with 'og' before the last item, as in English.",
          },
          {
            danish: "Bagefter køber jeg brød, ost og kaffe.",
            english: "Afterwards I buy bread, cheese and coffee.",
            structureNote: "'Bagefter' first, so 'køber jeg'.",
          },
          {
            danish: "Ved fryseren opdager jeg, at jeg har glemt mælken.",
            english: "At the freezer I realise that I have forgotten the milk.",
            structureNote:
              "Two clauses. 'Ved fryseren' inverts the first; 'at' opens what she realises.",
            constructCodes: ["subordinate-clauses"],
          },
          {
            danish: "Jeg må gå hele vejen tilbage.",
            english: "I have to walk all the way back.",
            structureNote: "'må' here means 'have to', not 'may'. Context decides which.",
          },
        ],
      },
      {
        translation: "At the till she cannot find her card; the woman behind her is unbothered.",
        sentences: [
          {
            danish: "Ved kassen kan jeg ikke finde mit kort.",
            english: "At the till I cannot find my card.",
            structureNote:
              "'Ved kassen' first, so 'kan jeg'. Then 'ikke' after the subject, and 'finde' stays in the infinitive after 'kan'.",
          },
          {
            danish: "Det ligger i den forkerte lomme.",
            english: "It is in the wrong pocket.",
            structureNote: "'ligger' again — a card lies in a pocket, it does not 'be' there.",
          },
          {
            danish: "Kvinden bag mig venter tålmodigt.",
            english: "The woman behind me waits patiently.",
            structureNote: "'bag mig' = behind me. 'tålmodigt' is the adverb form, with -t.",
          },
          {
            danish: "Hun siger, at hun også glemmer ting hele tiden.",
            english: "She says that she forgets things all the time too.",
            structureNote: "'at' opens what she says. 'hele tiden' = all the time.",
            constructCodes: ["subordinate-clauses"],
          },
        ],
      },
      {
        translation: "She cycles home with heavy bags and makes a resolution she makes every week.",
        sentences: [
          {
            danish: "Jeg cykler hjem med to tunge poser.",
            english: "I cycle home with two heavy bags.",
            structureNote: "'tunge' is the plural form of 'tung', agreeing with 'poser'.",
          },
          {
            danish: "Næste gang bestiller jeg måske på nettet.",
            english: "Next time I will maybe order online.",
            structureNote:
              "'Næste gang' first, so 'bestiller jeg'. Present tense used for the future, as Danish normally does.",
          },
          {
            danish: "Det siger jeg hver uge.",
            english: "I say that every week.",
            structureNote:
              "'Det' is first here as the object, not the subject — so 'siger jeg'. The last line is the joke.",
          },
        ],
      },
    ],
    keyVocabulary: [
      { danish: "at handle", english: "to shop / do the shopping" },
      { danish: "en indkøbsliste", english: "a shopping list" },
      { danish: "at glemme", english: "to forget" },
      { danish: "frugt og grønt", english: "fruit and vegetables" },
      { danish: "en pose", english: "a bag" },
      { danish: "ved kassen", english: "at the till" },
      { danish: "tålmodigt", english: "patiently" },
      { danish: "at bestille", english: "to order" },
    ],
    glossary: [
      { surface: "handler", lemma: "handle", englishGloss: "shop", partOfSpeech: "verb", inflectionNote: "Present of 'at handle' — to do the shopping. 'købe ind' means the same thing." },
      { surface: "altid", lemma: "altid", englishGloss: "always", partOfSpeech: "adverb", inflectionNote: "Sits straight after the verb in a main clause: 'jeg handler altid'." },
      { surface: "butikken", lemma: "butik", englishGloss: "the shop", partOfSpeech: "noun", inflectionNote: "Definite singular: butik → butikken. The -k doubles before the ending." },
      { surface: "liste", lemma: "liste", englishGloss: "list", partOfSpeech: "noun", inflectionNote: "Common gender: en liste / listen." },
      { surface: "glemmer", lemma: "glemme", englishGloss: "forget", partOfSpeech: "verb", inflectionNote: "Present of 'at glemme'. Past is 'glemte', participle 'glemt'." },
      { surface: "Først", lemma: "først", englishGloss: "first", partOfSpeech: "adverb", inflectionNote: "Sequence, not the number one. Starting a clause with it pushes the subject behind the verb." },
      { surface: "frugt", lemma: "frugt", englishGloss: "fruit", partOfSpeech: "noun", inflectionNote: "Common gender. 'frugt og grønt' is the fixed name for that part of a Danish supermarket." },
      { surface: "æbler", lemma: "æble", englishGloss: "apples", partOfSpeech: "noun", inflectionNote: "Plural of the et-word 'æble': et æble → æbler → æblerne." },
      { surface: "pose", lemma: "pose", englishGloss: "bag", partOfSpeech: "noun", inflectionNote: "Common gender: en pose / posen / poser. A carrier bag or a packet." },
      { surface: "gulerødder", lemma: "gulerod", englishGloss: "carrots", partOfSpeech: "noun", inflectionNote: "Plural of 'gulerod' — literally 'yellow root'. The vowel changes: rod → rødder." },
      { surface: "ost", lemma: "ost", englishGloss: "cheese", partOfSpeech: "noun", inflectionNote: "Common gender: en ost / osten. Uncountable when you just mean cheese in general." },
      { surface: "fryseren", lemma: "fryser", englishGloss: "the freezer", partOfSpeech: "noun", inflectionNote: "Definite singular: fryser → fryseren." },
      { surface: "opdager", lemma: "opdage", englishGloss: "realise / discover", partOfSpeech: "verb", inflectionNote: "Present of 'at opdage'." },
      { surface: "mælken", lemma: "mælk", englishGloss: "the milk", partOfSpeech: "noun", inflectionNote: "Definite singular: mælk → mælken." },
      { surface: "må", lemma: "måtte", englishGloss: "have to", partOfSpeech: "verb", inflectionNote: "Present of the modal 'at måtte'. It means both 'may' and 'have to' — here the second. The following verb stays in the infinitive." },
      { surface: "kassen", lemma: "kasse", englishGloss: "the till", partOfSpeech: "noun", inflectionNote: "Definite singular of 'kasse' (box, till). 'ved kassen' = at the checkout." },
      { surface: "kort", lemma: "kort", englishGloss: "card", partOfSpeech: "noun", inflectionNote: "Neuter, same form in the plural: et kort, to kort. Also means 'map' and, as an adjective, 'short'." },
      { surface: "forkerte", lemma: "forkert", englishGloss: "wrong", partOfSpeech: "adjective", inflectionNote: "Definite form (-e) because of 'den' in front: den forkerte lomme." },
      { surface: "lomme", lemma: "lomme", englishGloss: "pocket", partOfSpeech: "noun", inflectionNote: "Common gender: en lomme / lommen." },
      { surface: "Kvinden", lemma: "kvinde", englishGloss: "the woman", partOfSpeech: "noun", inflectionNote: "Definite singular: kvinde → kvinden." },
      { surface: "venter", lemma: "vente", englishGloss: "waits", partOfSpeech: "verb", inflectionNote: "Present of 'at vente'. 'vente på' = wait for." },
      { surface: "tålmodigt", lemma: "tålmodig", englishGloss: "patiently", partOfSpeech: "adverb", inflectionNote: "The -t turns the adjective 'tålmodig' into an adverb, describing how she waits." },
      { surface: "cykler", lemma: "cykle", englishGloss: "cycle", partOfSpeech: "verb", inflectionNote: "Present of 'at cykle'. The noun 'en cykel' is the bicycle itself." },
      { surface: "tunge", lemma: "tung", englishGloss: "heavy", partOfSpeech: "adjective", inflectionNote: "Plural form (-e) agreeing with 'poser'. Singular would be 'tung' or, with an et-word, 'tungt'." },
      { surface: "bestiller", lemma: "bestille", englishGloss: "order", partOfSpeech: "verb", inflectionNote: "Present of 'at bestille'. Used for ordering goods and for booking an appointment." },
      { surface: "måske", lemma: "måske", englishGloss: "maybe", partOfSpeech: "adverb", inflectionNote: "Does not change. Can open a sentence, which then inverts: 'Måske bestiller jeg ...'." },
      { surface: "nettet", lemma: "net", englishGloss: "the internet", partOfSpeech: "noun", inflectionNote: "Definite singular of 'net'. 'på nettet' = online." },
      { surface: "lørdag", lemma: "lørdag", englishGloss: "Saturday", partOfSpeech: "noun", inflectionNote: "Days of the week take no article and no capital letter: 'lørdag morgen' = on Saturday morning." },
      { surface: "morgen", lemma: "morgen", englishGloss: "morning", partOfSpeech: "noun", inflectionNote: "Common gender: en morgen / morgenen. 'lørdag morgen' needs no preposition." },
      { surface: "mennesker", lemma: "menneske", englishGloss: "people", partOfSpeech: "noun", inflectionNote: "Plural of the et-word 'menneske' — a human being." },
      { surface: "skriver", lemma: "skrive", englishGloss: "write", partOfSpeech: "verb", inflectionNote: "Present of 'at skrive'. Past is 'skrev', participle 'skrevet'." },
      { surface: "noget", lemma: "noget", englishGloss: "something", partOfSpeech: "pronoun", inflectionNote: "Neuter form of 'nogen'. 'nogen' for en-words and people, 'noget' for et-words and things in general." },
      { surface: "grønt", lemma: "grønt", englishGloss: "vegetables", partOfSpeech: "noun", inflectionNote: "In 'frugt og grønt' it means vegetables collectively. On its own 'grønt' is also the neuter of 'grøn' (green)." },
      { surface: "tomater", lemma: "tomat", englishGloss: "tomatoes", partOfSpeech: "noun", inflectionNote: "Plural of 'tomat': en tomat → tomater → tomaterne." },
      { surface: "Bagefter", lemma: "bagefter", englishGloss: "afterwards", partOfSpeech: "adverb", inflectionNote: "Starting a clause with it pushes the subject behind the verb: 'Bagefter køber jeg'." },
      { surface: "køber", lemma: "købe", englishGloss: "buy", partOfSpeech: "verb", inflectionNote: "Present of 'at købe'. With 'ind' it becomes 'do the shopping'." },
      { surface: "kaffe", lemma: "kaffe", englishGloss: "coffee", partOfSpeech: "noun", inflectionNote: "Common gender, usually used without an article: 'drikke kaffe'." },
      { surface: "glemt", lemma: "glemme", englishGloss: "forgotten", partOfSpeech: "verb", inflectionNote: "Past participle of 'at glemme', used with 'har' to say something has happened." },
      { surface: "vejen", lemma: "vej", englishGloss: "the way", partOfSpeech: "noun", inflectionNote: "Definite singular: vej → vejen. 'hele vejen tilbage' = all the way back." },
      { surface: "tilbage", lemma: "tilbage", englishGloss: "back", partOfSpeech: "adverb", inflectionNote: "Does not change. 'gå tilbage' = go back; 'frem og tilbage' = back and forth." },
      { surface: "finde", lemma: "finde", englishGloss: "find", partOfSpeech: "verb", inflectionNote: "Infinitive after 'kan'. Past is 'fandt', participle 'fundet'." },
      { surface: "ligger", lemma: "ligge", englishGloss: "is", partOfSpeech: "verb", inflectionNote: "Present of 'at ligge' — to lie flat. Danish says a card 'lies' in a pocket rather than 'is' there." },
      { surface: "siger", lemma: "sige", englishGloss: "says", partOfSpeech: "verb", inflectionNote: "Present of 'at sige'. Past is 'sagde', pronounced roughly 'sa'." },
      { surface: "tiden", lemma: "tid", englishGloss: "the time", partOfSpeech: "noun", inflectionNote: "Definite singular. 'hele tiden' = all the time, constantly." },
      { surface: "poser", lemma: "pose", englishGloss: "bags", partOfSpeech: "noun", inflectionNote: "Plural of 'pose': en pose → poser → poserne." },
      { surface: "Næste", lemma: "næste", englishGloss: "next", partOfSpeech: "adjective", inflectionNote: "Does not change: næste gang, næste uge, næste weekend." },
    ],
  },
  // -------------------------------------------------------------------
  // Level 3 — an informational text. Past tense, subordinate clauses,
  // and the register of something you would actually read online.
  // -------------------------------------------------------------------
  {
    id: "lib-hjemmearbejde",
    title: "Working from home in Denmark",
    danishTitle: "Sådan arbejder mange danskere hjemmefra",
    genre: "article",
    level: 3,
    summary:
      "Working from home was unusual in Denmark before 2020; now around a third of employees do it at least one day a week. Employers found that people got as much done at home, and many workplaces kept the arrangement. Employees save travelling time, but some miss their colleagues, and researchers say new employees learn less when nobody is in the office. Most workplaces have therefore settled on a mix: two or three days at the office and the rest at home.",
    focusConstructs: ["past-tense", "subordinate-clauses", "passive-voice"],
    paragraphs: [
      {
        translation: "How unusual home working used to be, and how common it is now.",
        sentences: [
          {
            danish: "For få år siden var det usædvanligt at arbejde hjemmefra.",
            english: "A few years ago it was unusual to work from home.",
            structureNote:
              "'For ... siden' = ago, wrapped around the time. It fills position 1, so 'var det' and not 'det var'.",
            constructCodes: ["past-tense"],
          },
          {
            danish: "I dag gør omkring en tredjedel af alle ansatte det mindst én dag om ugen.",
            english: "Today around a third of all employees do it at least one day a week.",
            structureNote: "'I dag' first, so 'gør' second. 'om ugen' = per week.",
          },
          {
            danish: "Forandringen skete hurtigt, og de fleste arbejdspladser beholdt den bagefter.",
            english: "The change happened quickly, and most workplaces kept it afterwards.",
            structureNote:
              "'skete' and 'beholdt' are both past. 'beholde' is irregular: beholder → beholdt.",
            constructCodes: ["past-tense"],
          },
        ],
      },
      {
        translation: "What employers discovered, and what employees gain.",
        sentences: [
          {
            danish: "Mange arbejdsgivere var i begyndelsen bekymrede.",
            english: "Many employers were worried at first.",
            structureNote: "'bekymrede' is the plural form, agreeing with 'arbejdsgivere'.",
            constructCodes: ["past-tense", "adjective-agreement"],
          },
          {
            danish: "De troede, at folk ville lave mindre derhjemme.",
            english: "They thought people would get less done at home.",
            structureNote: "'at' opens what they thought. 'ville' is the past of the modal 'vil'.",
            constructCodes: ["subordinate-clauses"],
          },
          {
            danish: "Men undersøgelser viste, at der ikke var stor forskel.",
            english: "But studies showed that there was not a big difference.",
            structureNote:
              "Inside the 'at' clause, 'ikke' comes before the verb: 'at der ikke var'. In a main clause it would be 'der var ikke'.",
            constructCodes: ["subordinate-clauses"],
          },
          {
            danish: "Samtidig sparer de ansatte tid, fordi de ikke skal transportere sig frem og tilbage.",
            english: "At the same time employees save time, because they do not have to travel back and forth.",
            structureNote:
              "'Samtidig' inverts the main clause; 'fordi' opens the reason, and 'ikke' again sits in front of the verb inside it.",
            constructCodes: ["subordinate-clauses"],
          },
        ],
      },
      {
        translation: "The costs: isolation, and new employees learning less.",
        sentences: [
          {
            danish: "Alle er dog ikke lige begejstrede.",
            english: "Not everybody is equally enthusiastic, though.",
            structureNote: "'dog' = though, however. It sits inside the sentence, not at the front.",
          },
          {
            danish: "Nogle savner deres kolleger og den daglige snak ved kaffemaskinen.",
            english: "Some miss their colleagues and the daily chat by the coffee machine.",
            structureNote: "'den daglige snak' — definite, so the adjective takes -e.",
            constructCodes: ["adjective-agreement"],
          },
          {
            danish: "Forskere peger også på, at nye medarbejdere lærer mindre, når ingen er på kontoret.",
            english: "Researchers also point out that new employees learn less when nobody is in the office.",
            structureNote:
              "Three clauses stacked: the main one, then 'at', then 'når' inside that. This is the sentence length PD3 reading expects.",
            constructCodes: ["multiple-subordinate-clauses"],
          },
          {
            danish: "Meget bliver nemlig lært ved at høre, hvad andre gør.",
            english: "A lot is in fact learned by hearing what others do.",
            structureNote:
              "'bliver lært' is the passive: 'bliver' plus the participle. Who does the teaching is not named, because it is everybody.",
            constructCodes: ["passive-voice"],
          },
        ],
      },
      {
        translation: "Where most workplaces have landed.",
        sentences: [
          {
            danish: "Derfor har de fleste arbejdspladser valgt en blanding.",
            english: "That is why most workplaces have chosen a mix.",
            structureNote:
              "'Derfor' first, so 'har' second. 'har valgt' — the perfect, for something decided and still true.",
            constructCodes: ["connectors"],
          },
          {
            danish: "To eller tre dage på kontoret, og resten hjemme.",
            english: "Two or three days at the office, and the rest at home.",
            structureNote: "No verb — a summing-up line, the way a Danish article often ends.",
          },
        ],
      },
    ],
    keyVocabulary: [
      { danish: "hjemmefra", english: "from home" },
      { danish: "en ansat / en medarbejder", english: "an employee" },
      { danish: "en arbejdsgiver", english: "an employer" },
      { danish: "en undersøgelse", english: "a study / survey" },
      { danish: "at spare tid", english: "to save time" },
      { danish: "en forskel", english: "a difference" },
      { danish: "at savne", english: "to miss" },
      { danish: "en blanding", english: "a mix" },
    ],
    glossary: [
      { surface: "usædvanligt", lemma: "usædvanlig", englishGloss: "unusual", partOfSpeech: "adjective", inflectionNote: "Neuter form (+t) agreeing with 'det'. Built from 'sædvanlig' (usual) with the negating prefix u-." },
      { surface: "hjemmefra", lemma: "hjemmefra", englishGloss: "from home", partOfSpeech: "adverb", inflectionNote: "One word: hjemme (at home) + fra (from). 'Arbejde hjemmefra' is the fixed expression." },
      { surface: "tredjedel", lemma: "tredjedel", englishGloss: "third", partOfSpeech: "noun", inflectionNote: "Fractions are built with -del: en tredjedel, en fjerdedel, en halv." },
      { surface: "ansatte", lemma: "ansat", englishGloss: "employees", partOfSpeech: "noun", inflectionNote: "Plural of 'en ansat' — a past participle used as a noun, literally 'an employed one'." },
      { surface: "Forandringen", lemma: "forandring", englishGloss: "the change", partOfSpeech: "noun", inflectionNote: "Definite singular: forandring → forandringen." },
      { surface: "skete", lemma: "ske", englishGloss: "happened", partOfSpeech: "verb", inflectionNote: "Past of 'at ske' — to happen. Only used of events, never of people." },
      { surface: "beholdt", lemma: "beholde", englishGloss: "kept", partOfSpeech: "verb", inflectionNote: "Past of 'at beholde'. Irregular: beholder → beholdt → beholdt." },
      { surface: "arbejdsgivere", lemma: "arbejdsgiver", englishGloss: "employers", partOfSpeech: "noun", inflectionNote: "Plural. A compound: arbejde (work) + giver (giver). The opposite is 'arbejdstager'." },
      { surface: "bekymrede", lemma: "bekymret", englishGloss: "worried", partOfSpeech: "adjective", inflectionNote: "Plural form agreeing with 'arbejdsgivere'. Singular is 'bekymret'." },
      { surface: "troede", lemma: "tro", englishGloss: "thought", partOfSpeech: "verb", inflectionNote: "Past of 'at tro' — to think in the sense of believe. Irregular: tror → troede." },
      { surface: "ville", lemma: "ville", englishGloss: "would", partOfSpeech: "verb", inflectionNote: "Past of the modal 'at ville'. Used for something expected from a point in the past." },
      { surface: "undersøgelser", lemma: "undersøgelse", englishGloss: "studies", partOfSpeech: "noun", inflectionNote: "Plural of 'undersøgelse' — a study, survey or examination, including at the doctor." },
      { surface: "viste", lemma: "vise", englishGloss: "showed", partOfSpeech: "verb", inflectionNote: "Past of 'at vise'. Formed with -te." },
      { surface: "forskel", lemma: "forskel", englishGloss: "difference", partOfSpeech: "noun", inflectionNote: "Common gender: en forskel / forskellen. 'Der er stor forskel på ...' = there is a big difference between ..." },
      { surface: "Samtidig", lemma: "samtidig", englishGloss: "at the same time", partOfSpeech: "adverb", inflectionNote: "Opens a sentence and inverts it. Often introduces the other half of an argument." },
      { surface: "sparer", lemma: "spare", englishGloss: "save", partOfSpeech: "verb", inflectionNote: "Present of 'at spare'. Used of both money and time." },
      { surface: "transportere", lemma: "transportere", englishGloss: "travel / transport", partOfSpeech: "verb", inflectionNote: "Infinitive after 'skal'. Reflexive here — 'transportere sig' means to get yourself somewhere." },
      { surface: "dog", lemma: "dog", englishGloss: "though / however", partOfSpeech: "adverb", inflectionNote: "Sits inside the sentence rather than at the front, and softens or contradicts what came before." },
      { surface: "begejstrede", lemma: "begejstret", englishGloss: "enthusiastic", partOfSpeech: "adjective", inflectionNote: "Plural form agreeing with 'alle'." },
      { surface: "savner", lemma: "savne", englishGloss: "miss", partOfSpeech: "verb", inflectionNote: "Present of 'at savne' — to miss somebody or something you are without. Not 'mangle', which means something is lacking." },
      { surface: "daglige", lemma: "daglig", englishGloss: "daily", partOfSpeech: "adjective", inflectionNote: "Definite form (-e) because 'den' comes in front: den daglige snak." },
      { surface: "Forskere", lemma: "forsker", englishGloss: "researchers", partOfSpeech: "noun", inflectionNote: "Plural of 'forsker'. From 'at forske' — to do research." },
      { surface: "medarbejdere", lemma: "medarbejder", englishGloss: "employees / colleagues", partOfSpeech: "noun", inflectionNote: "Plural. Literally 'co-workers'; the usual polite word for staff in Danish workplaces." },
      { surface: "kontoret", lemma: "kontor", englishGloss: "the office", partOfSpeech: "noun", inflectionNote: "Definite singular of the et-word 'kontor'. 'på kontoret' = at the office." },
      { surface: "bliver", lemma: "blive", englishGloss: "is (being)", partOfSpeech: "verb", inflectionNote: "Here it builds the passive: 'bliver lært' = is learned. 'blive' plus a participle is the commonest Danish passive." },
      { surface: "lært", lemma: "lære", englishGloss: "learned", partOfSpeech: "verb", inflectionNote: "Past participle of 'at lære', used with 'bliver' to make the passive." },
      { surface: "nemlig", lemma: "nemlig", englishGloss: "in fact / you see", partOfSpeech: "adverb", inflectionNote: "Explains or justifies what was just said. Very common and hard to translate as one word." },
      { surface: "valgt", lemma: "vælge", englishGloss: "chosen", partOfSpeech: "verb", inflectionNote: "Past participle of 'at vælge'. Irregular: vælger → valgte → valgt." },
      { surface: "blanding", lemma: "blanding", englishGloss: "mix", partOfSpeech: "noun", inflectionNote: "Common gender: en blanding / blandingen. From 'at blande' — to mix." },
      { surface: "resten", lemma: "rest", englishGloss: "the rest", partOfSpeech: "noun", inflectionNote: "Definite singular: rest → resten." },
    ],
  },
  // -------------------------------------------------------------------
  // Level 4 — natural everyday Danish with an opinion in it. The step
  // before PD3: the writer is not just describing, they are arguing.
  // -------------------------------------------------------------------
  {
    id: "lib-derfor-cykler-danskerne",
    title: "Why Danes cycle",
    danishTitle: "Derfor cykler danskerne",
    genre: "article",
    level: 4,
    summary:
      "Foreigners are often surprised that Danes cycle in the rain, in winter and in suits. The writer argues it is not about health or the environment for most people — it is simply the fastest way across a Danish city, because the infrastructure was built for it over fifty years. Cycling is not treated as a sport but as transport, which is why nobody dresses for it. The writer admits the weather is genuinely unpleasant some days and that not everyone can cycle, but concludes that the reason it works is that the choice was made easy rather than virtuous.",
    focusConstructs: ["connectors", "subordinate-clauses", "passive-voice"],
    paragraphs: [
      {
        translation: "What surprises visitors, and the explanation they usually reach for.",
        sentences: [
          {
            danish: "Udlændinge undrer sig ofte over, at danskerne cykler i regnvejr.",
            english: "Foreigners are often surprised that Danes cycle in the rain.",
            structureNote:
              "'undre sig over' = be surprised at. Reflexive: the 'sig' is part of the verb.",
            constructCodes: ["subordinate-clauses"],
          },
          {
            danish: "De cykler også om vinteren og i jakkesæt.",
            english: "They also cycle in winter and in suits.",
            structureNote: "'om vinteren' = in winter, as a habit rather than one particular winter.",
          },
          {
            danish: "Mange tror, at det handler om sundhed eller miljø.",
            english: "Many people think it is about health or the environment.",
            structureNote: "'handle om' = be about. Nothing to do with shopping, despite 'at handle'.",
            constructCodes: ["subordinate-clauses"],
          },
          {
            danish: "For de fleste er forklaringen langt enklere.",
            english: "For most people the explanation is far simpler.",
            structureNote: "'For de fleste' first, so 'er forklaringen'. 'langt' intensifies: far, much.",
          },
        ],
      },
      {
        translation: "The real reason: it is quickest, because the city was built for it.",
        sentences: [
          {
            danish: "Cyklen er hurtigst.",
            english: "The bike is fastest.",
            structureNote: "'hurtigst' is the superlative of 'hurtig'. Four words, and the whole argument.",
          },
          {
            danish: "I en dansk by kommer man som regel hurtigere frem på cykel end i bil.",
            english: "In a Danish city you usually get there faster by bike than by car.",
            structureNote:
              "'man' = you/one, for people in general. 'hurtigere ... end' is the comparison.",
          },
          {
            danish: "Det skyldes, at cykelstierne blev bygget i mere end halvtreds år.",
            english: "That is because the cycle paths were built over more than fifty years.",
            structureNote:
              "'skyldes' is a passive-only verb: it is due to. Then 'blev bygget' — the past passive.",
            constructCodes: ["passive-voice", "subordinate-clauses"],
          },
          {
            danish: "Der blev ikke bygget en sti hist og her, men et helt net.",
            english: "It was not a path built here and there, but a whole network.",
            structureNote:
              "Passive again, with 'ikke ... men' setting up the contrast. 'hist og her' is a fixed expression.",
            constructCodes: ["passive-voice"],
          },
        ],
      },
      {
        translation: "Cycling as transport, not sport — and what follows from that.",
        sentences: [
          {
            danish: "En anden forskel er, at cykling ikke opfattes som sport.",
            english: "Another difference is that cycling is not seen as a sport.",
            structureNote:
              "'opfattes' is the -s passive: is perceived. And 'ikke' comes before it, because this is a subordinate clause.",
            constructCodes: ["passive-voice", "subordinate-clauses"],
          },
          {
            danish: "Derfor tager ingen cykeltøj på for at køre to kilometer.",
            english: "That is why nobody puts on cycling clothes to ride two kilometres.",
            structureNote: "'for at' + infinitive = in order to. 'tage tøj på' = put clothes on.",
            constructCodes: ["connectors"],
          },
          {
            danish: "Man tager bare det tøj på, man alligevel skal have på.",
            english: "You just put on the clothes you were going to wear anyway.",
            structureNote:
              "A relative clause with the 'som' left out — normal in spoken Danish and common in writing.",
            constructCodes: ["subordinate-clauses"],
          },
        ],
      },
      {
        translation: "The honest objections, and the conclusion the writer draws from them.",
        sentences: [
          {
            danish: "Det skal siges, at vejret nogle dage er rigtig ubehageligt.",
            english: "It has to be said that on some days the weather is genuinely unpleasant.",
            structureNote:
              "'Det skal siges' — passive with a modal. A polite way of conceding a point.",
            constructCodes: ["passive-voice"],
          },
          {
            danish: "Og selvom mange kan cykle, kan alle ikke.",
            english: "And even though many people can cycle, not everybody can.",
            structureNote:
              "'selvom' concedes and comes first, so the main clause starts with its verb: 'kan alle ikke'.",
            constructCodes: ["connectors", "subordinate-clauses"],
          },
          {
            danish: "Til gengæld viser eksemplet noget vigtigt.",
            english: "On the other hand, the example shows something important.",
            structureNote: "'Til gengæld' balances: here is the other side.",
            constructCodes: ["connectors"],
          },
          {
            danish: "Folk ændrer sjældent vaner, fordi de bliver bedt om det.",
            english: "People rarely change habits because they are asked to.",
            structureNote:
              "'bliver bedt om' — passive of 'bede om' (ask for). 'sjældent' sits after the verb.",
            constructCodes: ["passive-voice", "subordinate-clauses"],
          },
          {
            danish: "De ændrer dem, når det nemmeste også er det bedste.",
            english: "They change them when the easiest thing is also the best.",
            structureNote:
              "'når' opens the condition. 'det nemmeste' and 'det bedste' are superlatives used as nouns.",
            constructCodes: ["subordinate-clauses"],
          },
        ],
      },
    ],
    keyVocabulary: [
      { danish: "at undre sig over", english: "to be surprised at" },
      { danish: "at handle om", english: "to be about" },
      { danish: "en cykelsti", english: "a cycle path" },
      { danish: "som regel", english: "as a rule / usually" },
      { danish: "at skyldes", english: "to be due to" },
      { danish: "at opfatte som", english: "to see as / perceive as" },
      { danish: "en vane", english: "a habit" },
      { danish: "til gengæld", english: "on the other hand" },
    ],
    glossary: [
      { surface: "Udlændinge", lemma: "udlænding", englishGloss: "foreigners", partOfSpeech: "noun", inflectionNote: "Plural of 'udlænding'. Built from 'ud' (out) + 'land' (country)." },
      { surface: "undrer", lemma: "undre", englishGloss: "are surprised", partOfSpeech: "verb", inflectionNote: "Only used reflexively: 'undre sig over' = to wonder at, be surprised by. The 'sig' is not optional." },
      { surface: "regnvejr", lemma: "regnvejr", englishGloss: "rainy weather", partOfSpeech: "noun", inflectionNote: "Neuter compound: regn (rain) + vejr (weather). 'i regnvejr' = in the rain." },
      { surface: "jakkesæt", lemma: "jakkesæt", englishGloss: "suit", partOfSpeech: "noun", inflectionNote: "Neuter, same form in the plural: et jakkesæt, to jakkesæt. Literally 'jacket set'." },
      { surface: "handler", lemma: "handle", englishGloss: "is about", partOfSpeech: "verb", inflectionNote: "'handle om' = be about. The same verb also means 'to shop' — the 'om' is what decides." },
      { surface: "sundhed", lemma: "sundhed", englishGloss: "health", partOfSpeech: "noun", inflectionNote: "Common gender: en sundhed / sundheden, though usually used without an article." },
      { surface: "miljø", lemma: "miljø", englishGloss: "environment", partOfSpeech: "noun", inflectionNote: "Neuter: et miljø / miljøet." },
      { surface: "forklaringen", lemma: "forklaring", englishGloss: "the explanation", partOfSpeech: "noun", inflectionNote: "Definite singular. From 'at forklare' — to explain." },
      { surface: "enklere", lemma: "enkel", englishGloss: "simpler", partOfSpeech: "adjective", inflectionNote: "Comparative of 'enkel'. The -e- drops out: enkel → enklere → enklest." },
      { surface: "hurtigst", lemma: "hurtig", englishGloss: "fastest", partOfSpeech: "adjective", inflectionNote: "Superlative of 'hurtig': hurtig → hurtigere → hurtigst." },
      { surface: "man", lemma: "man", englishGloss: "you / one", partOfSpeech: "pronoun", inflectionNote: "People in general. Extremely common in Danish where English would say 'you' or use the passive." },
      { surface: "skyldes", lemma: "skyldes", englishGloss: "is due to", partOfSpeech: "verb", inflectionNote: "Exists only in this -s form. 'Det skyldes, at ...' = the reason is that ..." },
      { surface: "cykelstierne", lemma: "cykelsti", englishGloss: "the cycle paths", partOfSpeech: "noun", inflectionNote: "Definite plural: cykelsti → cykelstier → cykelstierne." },
      { surface: "bygget", lemma: "bygge", englishGloss: "built", partOfSpeech: "verb", inflectionNote: "Past participle of 'at bygge'. With 'blev' it makes the past passive: were built." },
      { surface: "halvtreds", lemma: "halvtreds", englishGloss: "fifty", partOfSpeech: "numeral", inflectionNote: "Danish numbers above forty count in twenties: halvtreds is two and a half twenties. It has to be learned, not worked out." },
      { surface: "opfattes", lemma: "opfatte", englishGloss: "is seen as", partOfSpeech: "verb", inflectionNote: "The -s passive of 'at opfatte'. 'opfattes som' = is perceived as." },
      { surface: "cykeltøj", lemma: "cykeltøj", englishGloss: "cycling clothes", partOfSpeech: "noun", inflectionNote: "Neuter compound: cykel + tøj (clothes). 'tøj' has no plural — it is already collective." },
      { surface: "alligevel", lemma: "alligevel", englishGloss: "anyway", partOfSpeech: "adverb", inflectionNote: "Means 'anyway' or 'after all', depending on where it sits." },
      { surface: "ubehageligt", lemma: "ubehagelig", englishGloss: "unpleasant", partOfSpeech: "adjective", inflectionNote: "Neuter (+t) agreeing with 'vejret'. Built with the negating prefix u- on 'behagelig' (pleasant)." },
      { surface: "selvom", lemma: "selvom", englishGloss: "even though", partOfSpeech: "conjunction", inflectionNote: "Concedes a point. Opens a subordinate clause, and when that clause comes first the main clause starts with its verb." },
      { surface: "gengæld", lemma: "gengæld", englishGloss: "return", partOfSpeech: "noun", inflectionNote: "Only really used in 'til gengæld', which introduces the balancing other side of an argument." },
      { surface: "sjældent", lemma: "sjælden", englishGloss: "rarely", partOfSpeech: "adverb", inflectionNote: "Adverb form of 'sjælden' (rare). Sits after the verb in a main clause." },
      { surface: "vaner", lemma: "vane", englishGloss: "habits", partOfSpeech: "noun", inflectionNote: "Plural of 'vane': en vane → vaner → vanerne." },
      { surface: "bedt", lemma: "bede", englishGloss: "asked", partOfSpeech: "verb", inflectionNote: "Past participle of 'at bede'. 'blive bedt om noget' = to be asked to do something." },
      { surface: "nemmeste", lemma: "nem", englishGloss: "easiest", partOfSpeech: "adjective", inflectionNote: "Superlative of 'nem' used as a noun with 'det': 'det nemmeste' = the easiest thing." },
      { surface: "bedste", lemma: "god", englishGloss: "best", partOfSpeech: "adjective", inflectionNote: "Superlative of 'god'. Irregular: god → bedre → bedst, like English good/better/best." },
    ],
  },
];
