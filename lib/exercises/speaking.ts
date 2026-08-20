import type { ExerciseVariant } from "./types";

// Tale / samtale — DU3 Modul 2 level speaking prompts.
//
// Level discipline matters more here than anywhere else. Modul 2 speaking is
// everyday description and simple narration: where you live, what you did last
// weekend, what you are going to do. Opinion questions stay concrete ("hvad
// kan du bedst lide ved..."), never abstract debate. Each set moves from
// present, to past, to future, which is the tense range being examined.
//
// Not machine-graded — spoken answers can't be checked by the app. These are
// recorded as completed, with follow-ups and phrases to rehearse against.

export const SPEAKING_VARIANTS: ExerciseVariant[] = [
  {
    variantId: "s-interview-hverdag",
    category: "SPEAKING",
    taskType: "speaking_interview",
    moduleId: 2,
    topic: "Hverdagsliv",
    title: "Samtale om din hverdag",
    instruction: [
      "Læs spørgsmålene, og svar højt på dansk.",
      "Svar med hele sætninger, ikke kun ét ord.",
      "Prøv at tale i cirka to minutter i alt.",
    ],
    difficulty: "easy",
    content: {
      kind: "speaking",
      questions: [
        "Hvor bor du, og hvem bor du sammen med?",
        "Hvad laver du om morgenen, før du tager hjemmefra?",
        "Hvad lavede du i weekenden?",
        "Hvad skal du lave i næste weekend?",
        "Hvad kan du bedst lide at lave i din fritid?",
      ],
      followUps: [
        "Hvor længe har du boet der?",
        "Hvem lavede maden i weekenden?",
        "Hvorfor kan du godt lide det?",
        "Gør du det hver uge?",
      ],
      usefulPhrases: [
        { danish: "Jeg bor i en lejlighed sammen med...", english: "I live in an apartment with..." },
        { danish: "Først ... og bagefter ...", english: "First ... and afterwards ..." },
        { danish: "I weekenden var jeg ...", english: "At the weekend I was ..." },
        { danish: "Næste weekend skal jeg ...", english: "Next weekend I'm going to ..." },
        { danish: "Det, jeg bedst kan lide, er ...", english: "What I like best is ..." },
      ],
    },
  },

  {
    variantId: "s-interview-arbejde",
    category: "SPEAKING",
    taskType: "speaking_interview",
    moduleId: 2,
    topic: "Arbejde og uddannelse",
    title: "Samtale om arbejde og uddannelse",
    instruction: [
      "Læs spørgsmålene, og svar højt på dansk.",
      "Svar med hele sætninger, ikke kun ét ord.",
      "Prøv at tale i cirka to minutter i alt.",
    ],
    difficulty: "easy",
    content: {
      kind: "speaking",
      questions: [
        "Arbejder du, eller går du i skole?",
        "Fortæl om en helt almindelig dag på dit arbejde eller på din skole.",
        "Hvad lavede du, før du kom til Danmark?",
        "Hvad vil du gerne arbejde med om fem år?",
        "Hvad er det bedste ved dit arbejde eller din uddannelse?",
      ],
      followUps: [
        "Hvor mange timer arbejder du om ugen?",
        "Hvem arbejder du sammen med?",
        "Var det svært at begynde?",
        "Hvad skal du gøre for at nå det?",
      ],
      usefulPhrases: [
        { danish: "Jeg arbejder som ... / Jeg går på ...", english: "I work as ... / I attend ..." },
        { danish: "Jeg møder klokken ... og har fri klokken ...", english: "I start at ... and finish at ..." },
        { danish: "Før jeg kom til Danmark, arbejdede jeg ...", english: "Before I came to Denmark, I worked ..." },
        { danish: "Om fem år vil jeg gerne ...", english: "In five years I'd like to ..." },
        { danish: "Det bedste er, at ...", english: "The best thing is that ..." },
      ],
    },
  },

  {
    variantId: "s-topic-bolig",
    category: "SPEAKING",
    taskType: "speaking_topic",
    moduleId: 2,
    topic: "Bolig",
    title: "Fortæl om din bolig",
    instruction: [
      "Du skal fortælle om din bolig.",
      "Tal sammenhængende i cirka ét minut.",
      "Brug punkterne nedenfor som hjælp, og svar bagefter på opfølgende spørgsmål.",
    ],
    difficulty: "easy",
    content: {
      kind: "speaking",
      situation:
        "Du skal fortælle om den bolig, du bor i nu. Fortæl om værelserne, hvad du bruger dem til, og hvad du synes om boligen.",
      questions: [
        "Hvordan ser din bolig ud? Hvor mange værelser er der?",
        "Hvilket rum bruger du mest, og hvorfor?",
        "Hvordan er området omkring, hvor du bor?",
        "Hvad ville du gerne ændre ved din bolig?",
      ],
      followUps: [
        "Hvor længe har du boet der?",
        "Boede du et andet sted før?",
        "Er der langt til indkøb og bus?",
        "Vil du gerne blive boende?",
      ],
      usefulPhrases: [
        { danish: "Jeg bor i en lejlighed på ... kvadratmeter.", english: "I live in an apartment of ... square metres." },
        { danish: "Der er ... værelser: et soveværelse, en stue og ...", english: "There are ... rooms: a bedroom, a living room and ..." },
        { danish: "Jeg bruger mest køkkenet, fordi ...", english: "I use the kitchen most, because ..." },
        { danish: "Der er ikke så langt til ...", english: "It's not very far to ..." },
        { danish: "Hvis jeg kunne, ville jeg gerne have ...", english: "If I could, I'd like to have ..." },
      ],
    },
  },

  {
    variantId: "s-situation-aftale",
    category: "SPEAKING",
    taskType: "speaking_situation",
    moduleId: 2,
    topic: "Fritid",
    title: "Lav en aftale med en ven",
    instruction: [
      "Læs situationen.",
      "Sig højt, hvad du vil sige til din ven.",
      "Husk at få alle punkterne med.",
    ],
    difficulty: "medium",
    content: {
      kind: "speaking",
      situation:
        "Du vil gerne i biografen med din ven i weekenden. Du ringer til din ven for at lave en aftale. Din ven har travlt om lørdagen.",
      questions: [
        "Foreslå, at I går i biografen sammen.",
        "Fortæl hvilken film du gerne vil se, og hvorfor.",
        "Find en dag og et tidspunkt, der passer jer begge.",
        "Aftal, hvor I skal mødes.",
        "Spørg, om din ven vil spise noget bagefter.",
      ],
      followUps: [
        "Hvad gør du, hvis din ven ikke kan den dag?",
        "Hvordan foreslår du et andet tidspunkt?",
        "Hvordan siger du pænt nej til et forslag?",
      ],
      usefulPhrases: [
        { danish: "Har du lyst til at gå i biografen?", english: "Do you fancy going to the cinema?" },
        { danish: "Kan du på søndag i stedet?", english: "Can you on Sunday instead?" },
        { danish: "Passer det dig klokken syv?", english: "Does seven o'clock suit you?" },
        { danish: "Vi kan mødes foran biografen.", english: "We can meet in front of the cinema." },
        { danish: "Skal vi spise noget bagefter?", english: "Shall we get something to eat afterwards?" },
      ],
    },
  },
];
