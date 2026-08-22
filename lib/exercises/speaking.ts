import type { ExerciseVariant } from "./types";
import { stagesForTaskType } from "./speaking-patterns";

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

// ---------------------------------------------------------------------------
// Modultest opgave formats
//
// One authored variant per new task type. These matter for more than variety:
// without them, a learner with no ANTHROPIC_API_KEY would hit a task type that
// has nothing to fall back to, and speaking would break where it used to work.
// They also serve as the reference shape for what the generator should produce.
//
// The mindmap below uses the topic and keyword categories from the reference
// material as a worked example of the format. The generator writes others.
// ---------------------------------------------------------------------------

const MINDMAP_STAGES = stagesForTaskType("speaking_mindmap")!;
const INFO_GAP_STAGES = stagesForTaskType("speaking_information_gap")!;
const PREPARED_STAGES = stagesForTaskType("speaking_prepared_topic")!;
const PREFERENCE_STAGES = stagesForTaskType("speaking_picture_preference")!;

export const SPEAKING_OPGAVE_VARIANTS: ExerciseVariant[] = [
  {
    variantId: "s-mindmap-arbejde",
    category: "SPEAKING",
    taskType: "speaking_mindmap",
    moduleId: 2,
    topic: "Mit arbejde",
    title: "Opgave 1 — Fortæl om dit arbejde",
    instruction: MINDMAP_STAGES.map((s) => s.instruction),
    difficulty: "easy",
    content: {
      kind: "speaking",
      stages: MINDMAP_STAGES,
      mindmap: {
        title: "Mit arbejde",
        categories: [
          "dage / tid",
          "transport til arbejde",
          "arbejdsopgaver",
          "pauser",
          "job / arbejdssted",
          "kollegaer / chef",
        ],
      },
      questions: [
        "Hvor arbejder du?",
        "Hvilke dage arbejder du?",
        "Hvordan kommer du på arbejde?",
        "Hvad laver du på en almindelig dag?",
        "Hvem arbejder du sammen med?",
      ],
      followUps: [
        "Hvor længe tager turen?",
        "Hvornår holder I pause?",
        "Hvor ofte arbejder du om aftenen?",
        "Hvad hedder din chef?",
      ],
      usefulPhrases: [
        { danish: "Jeg arbejder på/i ...", english: "I work at/in ..." },
        { danish: "Jeg møder klokken ... og har fri klokken ...", english: "I start at ... and finish at ..." },
        { danish: "Jeg tager bussen / cykler / kører i bil.", english: "I take the bus / cycle / drive." },
        { danish: "Om formiddagen plejer jeg at ...", english: "In the mornings I usually ..." },
        { danish: "Jeg arbejder sammen med ...", english: "I work together with ..." },
      ],
    },
  },

  {
    variantId: "s-infogap-cafe",
    category: "SPEAKING",
    taskType: "speaking_information_gap",
    moduleId: 2,
    topic: "En kollega og hans arbejde",
    title: "Opgave 2 — I ved ikke det samme",
    instruction: INFO_GAP_STAGES.map((s) => s.instruction),
    difficulty: "medium",
    content: {
      kind: "speaking",
      stages: INFO_GAP_STAGES,
      situation:
        "Du og din partner taler om Maja, som I begge kender. I ved hver især noget forskelligt om hende.",
      informationGap: {
        sharedContext: "Maja er 26 år og bor i Odense. Hun arbejder på en café.",
        candidate: {
          holds: [
            { label: "arbejdstider", value: "Maja arbejder fra klokken 7 til klokken 15." },
            { label: "transport", value: "Hun cykler til arbejde. Det tager 10 minutter." },
            { label: "kollegaer", value: "Der er fire andre på caféen." },
          ],
          mustFindOut: ["fritid", "familie", "fremtidsplaner"],
        },
        partner: {
          holds: [
            { label: "fritid", value: "Maja spiller håndbold to gange om ugen." },
            { label: "familie", value: "Hun har en søster, der bor i Aarhus." },
            { label: "fremtidsplaner", value: "Hun vil gerne læse til sygeplejerske til næste år." },
          ],
          mustFindOut: ["arbejdstider", "transport", "kollegaer"],
        },
        requiredQuestions: [
          "Hvad laver Maja i sin fritid?",
          "Har Maja nogen søskende?",
          "Hvad vil Maja gerne lave i fremtiden?",
        ],
      },
      questions: [
        "Hvad laver Maja i sin fritid?",
        "Har Maja familie i Danmark?",
        "Hvad vil hun gerne i fremtiden?",
        "Hvor ofte gør hun det?",
      ],
      followUps: [
        "Kan du sige det en gang til?",
        "Hvor mange gange om ugen?",
        "Hvor bor hendes søster?",
      ],
      usefulPhrases: [
        { danish: "Ved du, hvad/hvor/hvornår ...?", english: "Do you know what/where/when ...?" },
        { danish: "Kan du fortælle mig noget om ...?", english: "Can you tell me something about ...?" },
        { danish: "Undskyld, kan du gentage det?", english: "Sorry, can you repeat that?" },
        { danish: "Hos mig står der, at ...", english: "On my sheet it says that ..." },
      ],
    },
  },

  {
    variantId: "s-prepared-hverdag",
    category: "SPEAKING",
    taskType: "speaking_prepared_topic",
    moduleId: 3,
    topic: "Arbejde og uddannelse",
    title: "Opgave 1 — Træk et emne og fortæl",
    instruction: PREPARED_STAGES.map((s) => s.instruction),
    difficulty: "medium",
    content: {
      kind: "speaking",
      stages: PREPARED_STAGES,
      preparedTopics: [
        {
          title: "Et arbejde, jeg gerne vil have",
          prompts: [
            "hvilket arbejde",
            "hvorfor lige det",
            "hvad skal man kunne",
            "hvad skal du gøre for at nå det",
            "hvad ville være svært",
          ],
        },
        {
          title: "Da jeg begyndte at lære dansk",
          prompts: [
            "hvornår og hvor",
            "hvordan det gik i starten",
            "hvad der var sværest",
            "hvad der hjalp dig",
            "hvordan det går nu",
          ],
        },
      ],
      questions: [
        "Vil du fortælle lidt mere om det?",
        "Kan du give et eksempel?",
        "Hvorfor er det vigtigt for dig?",
        "Hvad synes du er det sværeste ved det?",
      ],
      followUps: [
        "Hvad er din erfaring med det?",
        "Har du prøvet det før?",
        "Hvad ville du gøre anderledes i dag?",
      ],
      usefulPhrases: [
        { danish: "Det, jeg helst vil, er ...", english: "What I'd most like is ..." },
        { danish: "For eksempel ...", english: "For example ..." },
        { danish: "Grunden er, at ...", english: "The reason is that ..." },
        { danish: "Efter min mening ...", english: "In my opinion ..." },
        { danish: "Da jeg begyndte, kunne jeg ikke ...", english: "When I started, I couldn't ..." },
      ],
    },
  },

  {
    variantId: "s-preference-ferie",
    category: "SPEAKING",
    taskType: "speaking_picture_preference",
    moduleId: 3,
    topic: "Ferieformer",
    title: "Opgave 2 — Hvilken ferie vil I helst?",
    instruction: PREFERENCE_STAGES.map((s) => s.instruction),
    difficulty: "medium",
    content: {
      kind: "speaking",
      stages: PREFERENCE_STAGES,
      preferenceTopic: "Hvilken slags ferie vil du helst på?",
      preferenceOptions: [
        {
          id: "A",
          label: "Sommerhus ved stranden",
          description: "Et lille sommerhus tæt på vandet. Man laver selv mad og går lange ture.",
        },
        {
          id: "B",
          label: "Storbyferie",
          description: "Fire dage i en stor by med museer, butikker og restauranter.",
        },
        {
          id: "C",
          label: "Telttur i naturen",
          description: "Man sover i telt, bærer selv sin rygsæk og laver mad over bål.",
        },
        {
          id: "D",
          label: "Hjemme i haven",
          description: "Ferie derhjemme med tid til familien, haven og korte ture i nærheden.",
        },
      ],
      questions: [
        "Hvilken vil du helst vælge?",
        "Hvorfor lige den?",
        "Hvilken vil du slet ikke vælge?",
        "Hvad er godt ved den, din partner har valgt?",
      ],
      followUps: [
        "Har du prøvet sådan en ferie?",
        "Hvad er din erfaring med det?",
        "Hvad ville din familie helst?",
      ],
      usefulPhrases: [
        { danish: "Jeg vil helst vælge ..., fordi ...", english: "I'd rather choose ..., because ..." },
        { danish: "Det bedste ved ... er, at ...", english: "The best thing about ... is that ..." },
        { danish: "Hvad synes du om ...?", english: "What do you think about ...?" },
        { danish: "Jeg er enig / Det synes jeg ikke.", english: "I agree / I don't think so." },
        { danish: "Jeg foretrækker ... frem for ...", english: "I prefer ... over ..." },
      ],
    },
  },
];
