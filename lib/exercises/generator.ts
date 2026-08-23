import { generateStructured } from "@/lib/ai/generate";
import { aiAvailable } from "@/lib/ai/registry";
import {
  MindmapSchema,
  InformationGapSchema,
  PreparedTopicSchema,
  PicturePreferenceSchema,
  Task1Schema,
  Task2Schema,
  Task3Schema,
  Task4Schema,
  WritingSchema,
  SpeakingSchema,
} from "./schemas";
import { validateVariant } from "./validate";
import { demandsForModule, stagesForTaskType } from "./speaking-patterns";
import type { ExerciseCategory, ExerciseVariant, TaskType } from "./types";

// LLM generation of modultest-style exercises.
//
// Generation happens on demand and the result is stored on the attempt, so the
// answer key survives to grading time and never reaches the browser. Every
// generated exercise goes through Zod (shape) and then validate.ts (solvable,
// correctly keyed, self-grades clean). A failure regenerates once; if that
// fails too the caller falls back to the hand-authored pool, so the app keeps
// working without an API key or when the API is down.

export function llmGenerationAvailable(): boolean {
  return aiAvailable();
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const SYSTEM = `Du er ekspert i at skrive prøvemateriale til Danskuddannelse 3, Modul 2 (niveau A2) i Danmark.

Du skriver ORIGINALT materiale. Du må aldrig gengive tekster, navne, annoncer eller spørgsmål fra rigtige prøvesæt — kun genbruge selve opgaveformatet.

Sprogniveau (dette er vigtigt — skriv hverken for let eller for svært):
- Hverdagsdansk, som en voksen kursist på Modul 2 møder i praksis.
- Almindelige ord. Ingen sjældne eller litterære gloser, ingen fagsprog uden forklaring.
- Sætninger på typisk 8-18 ord. Hovedsætninger og enkle ledsætninger med fordi, når, at, hvis, men, og, selvom, derfor.
- Nutid og datid. Modalverber (kan, skal, vil, må, bør). Enkelt passiv (bliver + kort tillægsform) må gerne forekomme.
- Konkrete, genkendelige situationer: bolig, arbejde, uddannelse, familie, fritid, transport, indkøb, sundhed, ferie, medborgerskab.

Sværhedsgraden skal komme fra, at kursisten skal FORSTÅ og SAMMENHOLDE oplysninger — ikke fra svære gloser.

Alt indhold skal være på dansk. Kun feltet 'english' i usefulPhrases er på engelsk.`;

function task1Prompt(topic: string, avoid: string[]): string {
  return `Skriv en Læsning Opgave 1: kursisten skal matche personer med annoncer.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner, som kursisten lige har haft: ${avoid.join(", ")}.` : ""}

Format:
- Ét løst eksempel (0): en kort personbeskrivelse + bogstavet på den annonce, der passer. Brug altid "A" som eksemplets annonce.
- 4 personer med id "1", "2", "3", "4". Hver person er 2-3 sætninger.
- 7 annoncer med id "A", "B", "C", "D", "E", "F", "G". "A" hører til eksemplet.
- 4 af annoncerne B-G er svar. 2 af dem er IKKE svar på nogen person.

Regler, der gør opgaven fair og løsbar:
1. Hver person skal nævne MINDST TO konkrete krav — fx pris OG beliggenhed, eller type OG hvem det er til. Så kan opgaven ikke løses på ét enkelt nøgleord.
2. Præcis én annonce må opfylde ALLE en persons krav. Ingen person må kunne passe til to annoncer.
3. De 2 ubrugte annoncer skal virke realistiske og fristende, men falde på ét konkret, kontrollerbart punkt — fx for dyr, forkert by, forkert årstid, forkert aldersgruppe, til salg i stedet for til leje.
4. Annoncerne skal indeholde konkrete detaljer: pris i kroner, antal værelser eller m², bydel eller by, tidspunkter, hvem det henvender sig til, betingelser.
5. Eksemplets annonce A må ikke være svaret på nogen af de 4 personer.

For hvert svar skriver du en kort begrundelse på dansk (rationale), der forklarer, hvorfor netop den annonce passer, og gerne hvorfor en nærliggende annonce ikke gør.`;
}

function task2Prompt(topic: string, avoid: string[]): string {
  return `Skriv en Læsning Opgave 2: i hvert afsnit er der én sætning, der ikke passer.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Format:
- En sammenhængende tekst med en titel, delt i afsnit.
- Ét løst eksempel (afsnit 0) med 5-7 sætninger, hvor du angiver hvilken sætning der er forkert.
- 4 afsnit med id "1", "2", "3", "4", hver med 4-6 sætninger.
- I hvert afsnit er præcis ÉN sætning forkert. wrongIndex er dens plads i sentences-arrayet (0-baseret).

DET VIGTIGSTE — hvad gør en sætning "forkert":
Den forkerte sætning skal handle om det samme emne som resten af afsnittet, men MODSIGE de andre oplysninger i afsnittet.
Den må IKKE bare være et andet emne, og den må ikke være åbenlyst tåbelig.

Godt eksempel på princippet: et afsnit fortæller, at pædagogen deler børnene i to grupper, fordi de skal lave to forskellige aktiviteter — og den forkerte sætning siger "Alle skal lave det samme, for det er nemmest." Den passer emnemæssigt, men modsiger afsnittet.

Dårligt eksempel: et afsnit om en børnehave, hvor den forkerte sætning er "Hun tager altid til Spanien om sommeren." Det er bare et andet emne og kan gættes uden at læse.

Kursisten skal altså holde afsnittets oplysninger op mod hinanden for at finde fejlen.

For hvert afsnit skriver du i 'why' på dansk, hvilke oplysninger i afsnittet den forkerte sætning modsiger.`;
}

function task3Prompt(topic: string, avoid: string[]): string {
  return `Skriv en Læsning Opgave 3: kursisten skal skrive de ord, der mangler, fra en ordbank.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Format:
- En sammenhængende tekst med en titel, på cirka 120-160 ord.
- Teksten leveres som textSegments: præcis 8 tekststykker. Mellem hvert par af tekststykker er der et hul. Det giver 7 huller.
- 7 svar (answers), ét pr. hul, i rækkefølge.
- exampleWord + exampleSentence: en løst førstelinje. exampleSentence SKAL indeholde "___" der hvor ordet står.
- wordBank: præcis 12 ord = de 7 svar + exampleWord + præcis 4 ord, der IKKE skal bruges.

Regler:
1. Hvert ord i ordbanken må kun bruges én gang. Derfor må det samme ord aldrig være svar på to huller.
2. Brug mest funktionsord: bindeord (og, men, fordi, når, hvis, at, som, der), adverbier (meget, lidt, nu, altid, aldrig, også), modalverber (kan, skal, vil, må).
3. Et hul må ALDRIG stå først i en sætning. Ellers kan kursisten gætte på stort begyndelsesbogstav.
4. Hvert hul skal kunne afgøres ud fra sammenhængen OG grammatikken. Det må ikke kunne løses på grammatik alene — men der skal heller ikke være to ord i banken, der begge giver god mening i samme hul.
5. De 4 ubrugte ord skal være ord, der ser plausible ud i teksten, men som ikke passer noget sted.
6. Sørg for, at tekststykkerne sat sammen med svarene giver en helt naturlig, sammenhængende dansk tekst. Tegnsætning og mellemrum skal passe (tekststykker slutter typisk med et mellemrum før hullet).

For hvert svar skriver du en kort begrundelse på dansk (rationale): hvorfor netop det ord, og gerne hvorfor et nærliggende ord i banken ikke passer.`;
}

function task4Prompt(topic: string, avoid: string[]): string {
  return `Skriv en Læsning Opgave 4: kursisten skal finde ud af, hvem af tre personer hvert spørgsmål handler om.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Format:
- En overskrift, fx "Tre personer fortæller om ...".
- 3 personer med id "A", "B", "C", hver med et dansk fornavn og en tekst på 100-140 ord i jeg-form.
- Ét løst eksempel (0): et spørgsmål + hvilken person det er.
- 5 spørgsmål med id "1" til "5". Hvert spørgsmål begynder med "Hvem ...".

DET VIGTIGSTE — spørgsmålene skal kræve forståelse, ikke ordgenkendelse:
1. Svaret må ALDRIG være den person, der bruger de samme ord som spørgsmålet. Hvis spørgsmålet hedder "Hvem er studerende?", må den rigtige person ikke skrive ordet "studerende" — hun skriver fx "jeg læser til pædagog om aftenen". Kursisten skal selv slutte sig til det.
2. De tre tekster skal OVERLAPPE meget: alle tre skal fx nævne børn, eller penge, eller aftener, så man ikke kan scanne efter et enkelt ord og ramme rigtigt.
3. Mindst to forskellige personer skal være svaret på tværs af de 5 spørgsmål — gerne alle tre.
4. Hver person skal have mindst ét klart, men indirekte formuleret særtræk, som ét spørgsmål rammer.

For hvert spørgsmål skriver du i 'why' på dansk, hvad i personens tekst der gør ham eller hende til svaret, og gerne hvorfor en anden person kunne forveksles.`;
}

function writingPrompt(taskType: TaskType, topic: string, avoid: string[]): string {
  const kind =
    taskType === "writing_email"
      ? "en e-mail, som kursisten skal svare på"
      : taskType === "writing_message"
        ? "en kort besked (fx til en nabo eller kollega)"
        : "en kort sammenhængende tekst om et emne";

  return `Skriv en Skrivning-opgave til Modul 2. Opgavetypen er ${kind}.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Format:
- situation: 1-2 sætninger, der sætter scenen. Konkret og hverdagsagtig.
- task: hvad kursisten skal gøre, inkl. kravet om minimum antal ord.
- minWords: 70 for e-mail og tekst, 50 for en kort besked.
${
  taskType === "writing_email"
    ? `- incomingEmail: afsender, emne, selve mailen (med linjeskift, hilsen i starten og slutningen) og 3-4 spørgsmål, som kursisten SKAL svare på. Spørgsmålene skal også stå ordret inde i mailens body.
- answerHeader: to = afsenderens navn, subject = emnet.`
    : `- incomingEmail: null.
- answerHeader: sæt to hvis der er en tydelig modtager, ellers null.`
}
- mustInclude: 4-6 konkrete punkter, som kursistens tekst skal indeholde. Det sidste punkt må gerne stille et grammatisk krav, fx "mindst én sætning i datid".

Spørgsmålene og punkterne skal kunne besvares af en voksen på A2-niveau ud fra sit eget liv. Ingen abstrakte eller holdningsprægede emner.`;
}

// ---------------------------------------------------------------------------
// Speaking opgave prompts, assembled in layers
//
//   CORE (SYSTEM)  →  MODULE  →  TASK TYPE  →  EXERCISE CONFIG
//
// rather than one giant prompt. The module layer sets the communication
// demand — which is what actually separates Modul 2 from Modul 3 — and the
// task layer describes the format. Keeping them apart means a new module is a
// new module layer, not a rewritten prompt.
// ---------------------------------------------------------------------------

function moduleLayer(moduleId: number): string {
  const demands = demandsForModule(moduleId)
    .map((d) => DEMAND_DESCRIPTIONS[d])
    .join("\n  - ");
  return `MODUL ${moduleId}.
Kommunikationskrav på dette modul — eksaminator må stille spørgsmål af disse typer og ikke sværere:
  - ${demands}`;
}

const DEMAND_DESCRIPTIONS: Record<string, string> = {
  factual: "konkrete oplysninger: Hvad? Hvor? Hvornår? Hvem? Hvor ofte?",
  description: "beskrivelse: Hvordan er...? Fortæl om...",
  elaboration: "uddybning: Vil du fortælle lidt mere om...? Kan du give et eksempel?",
  preference: "præference: Hvad kan du bedst lide? Hvilken vil du helst vælge?",
  reasoning: "begrundelse: Hvorfor? Hvad er grunden til det?",
  experience: "erfaring: Hvad er din erfaring med...? Har du prøvet det?",
};

function mindmapPrompt(moduleId: number, topic: string, avoid: string[]): string {
  return `${moduleLayer(moduleId)}

OPGAVETYPE: Mindmap-præsentation (Opgave 1).
Kursisten får et emne med en håndfuld nøgleord omkring sig og skal fortælle om emnet. Nøgleordene er STØTTE, ikke spørgsmål — kursisten skal ikke svare på dem ét for ét, og det er ikke en hukommelsesøvelse.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Lav:
- mindmap.title: emnet, formuleret som på prøven, fx "Mit arbejde", "Min bolig", "Min sprogskole".
- mindmap.categories: 5-6 KORTE nøgleord, ikke sætninger og ikke spørgsmål. To ord adskilt af skråstreg er typisk, fx "dage / tid", "transport til arbejde", "kollegaer / chef", "værelser / m2", "alene / sammen med".
  Kategorierne skal passe til netop dette emne — et emne om bolig har andre kategorier end et emne om arbejde.
  Tilsammen skal de dække emnet fra flere sider, så kursisten har noget at tale ud fra i to minutter.
- questions: 4-6 spørgsmål, eksaminator kan åbne med bagefter. Konkrete, og de skal handle om emnet.
- followUps: 3-5 opfølgende spørgsmål.
- usefulPhrases: 4-6 vendinger, kursisten kan bruge, med engelsk betydning.`;
}

function informationGapPrompt(moduleId: number, topic: string, avoid: string[]): string {
  return `${moduleLayer(moduleId)}

OPGAVETYPE: Informationsudveksling (Opgave 2).
To personer ved IKKE det samme. Hver har nogle oplysninger og mangler nogle andre. De skal stille spørgsmål til hinanden for at få det, de mangler. Det er ikke en præsentation.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Lav:
- situation: én-to sætninger om, hvem kursisten er, og hvorfor han/hun spørger.
- informationGap.sharedContext: det, BEGGE ved på forhånd. Kort.
- informationGap.candidate.holds: 3-5 oplysninger, KURSISTEN har. Hver med label (hvad oplysningen handler om, fx "åbningstider") og value (selve oplysningen på dansk).
- informationGap.candidate.mustFindOut: 3-5 labels, kursisten MANGLER.
- informationGap.partner.holds: 3-5 oplysninger, partneren har.
- informationGap.partner.mustFindOut: 3-5 labels, partneren mangler.
- informationGap.requiredQuestions: 3-5 spørgsmål, kursisten er nødt til at stille.

ABSOLUTTE KRAV — opgaven virker ikke uden dem:
1. Alt i candidate.mustFindOut SKAL findes som en label i partner.holds. Ellers kan spørgsmålet ikke besvares.
2. Alt i partner.mustFindOut SKAL findes som en label i candidate.holds.
3. De to sider må IKKE have de samme labels i holds. Hvis begge ved det hele, er der ingen grund til at spørge, og så er der ingen opgave.
4. Udvekslingen skal gå BEGGE veje — begge parter mangler noget.

- questions, followUps, usefulPhrases: som normalt, men de skal handle om at spørge og svare.`;
}

function preparedTopicPrompt(moduleId: number, topic: string, avoid: string[]): string {
  return `${moduleLayer(moduleId)}

OPGAVETYPE: Forberedt emne (Opgave 1).
Kursisten får TO emner at forberede og trækker det ene. Derefter fortæller han/hun sammenhængende i 1-2 minutter, og eksaminator spørger ind i 3-4 minutter.

Emneområde denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Lav:
- preparedTopics: PRÆCIS 2 emner. Hvert med title og 4-6 prompts at forberede ud fra.
  De to emner skal være forskellige nok til, at det gør en forskel, hvilket der trækkes — ikke to varianter af det samme.
- questions: 4-6 spørgsmål til opfølgningen.
- followUps: 3-5 spørgsmål, der beder kursisten om at UDDYBE, ikke om nye fakta: "Vil du fortælle lidt mere om...?", "Kan du give et eksempel?", "Hvorfor det?", "Hvad synes du om...?", "Hvad er din erfaring med...?"
  Formulér dem så de passer til emnet — brug dem ikke ordret.
- usefulPhrases: 4-6 vendinger til at forklare og begrunde med.`;
}

function picturePreferencePrompt(moduleId: number, topic: string, avoid: string[]): string {
  return `${moduleLayer(moduleId)}

OPGAVETYPE: Valg og begrundelse med fire muligheder (Opgave 2).
Kursisten får ét emne og FIRE muligheder. Først taler kursisten med en partner: de sammenligner mulighederne, spørger hinanden, siger hvad de helst vil vælge, og begrunder det. Bagefter spørger eksaminator ind til kursistens egne erfaringer.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Lav:
- preferenceTopic: emnet, fx "Hvor vil du helst holde ferie?" eller "Hvordan vil du helst komme på arbejde?".
- preferenceOptions: PRÆCIS 4 muligheder. Hver med id ("A" til "D"), label (kort navn) og description (1-2 sætninger, der beskriver billedet, som det ville se ud på prøven — konkret, så der er noget at sammenligne på).
  De fire skal være reelt forskellige, så der er noget at vælge imellem og noget at begrunde.
- questions: 4-6 spørgsmål til pardiskussionen.
- followUps: 3-5 spørgsmål fra eksaminator bagefter, om kursistens egne erfaringer og grunde.
- usefulPhrases: 4-6 vendinger til at udtrykke præference og begrundelse med, fx "Jeg vil helst...", "Det bedste ved ... er, at...", "Jeg foretrækker ..., fordi ...".`;
}

function speakingPrompt(taskType: TaskType, topic: string, avoid: string[]): string {
  const kind =
    taskType === "speaking_interview"
      ? "en samtale, hvor eksaminator stiller spørgsmål"
      : taskType === "speaking_topic"
        ? "en opgave, hvor kursisten selv fortæller sammenhængende om et emne"
        : "en situation, hvor kursisten skal sige noget bestemt til en anden person";

  return `Skriv en Tale-opgave til Modul 2. Opgavetypen er ${kind}.

Emne denne gang: ${topic}.
${avoid.length ? `Undgå disse emner: ${avoid.join(", ")}.` : ""}

Format:
- situation: ${taskType === "speaking_interview" ? "null" : "1-2 sætninger, der sætter scenen"}.
- questions: 4-5 spørgsmål eller punkter.
- followUps: 3-4 opfølgende spørgsmål, som en eksaminator ville stille bagefter.
- usefulPhrases: 4-5 nyttige vendinger. Feltet 'danish' er sætningsstarten på dansk, 'english' er den engelske betydning.

Regler for niveauet:
1. Spørgsmålene skal spænde over nutid, datid OG fremtid — fx "Hvad laver du...", "Hvad lavede du sidste weekend...", "Hvad skal du...". Det er de tider, der prøves på Modul 2.
2. Spørg om kursistens eget konkrete hverdagsliv. Aldrig abstrakte diskussionsspørgsmål som "Hvad er konsekvenserne af globaliseringen?" eller "Hvad synes du om det danske samfund?".
3. Et spørgsmål må gerne bede om en simpel begrundelse ("hvorfor kan du godt lide det?"), men ikke om en argumentation.`;
}

// ---------------------------------------------------------------------------
// Topic pools — what the generator rotates through per task type
// ---------------------------------------------------------------------------

const TOPICS: Record<string, string[]> = {
  reading_task_1_matching: [
    "Bolig — folk der søger et sted at bo",
    "Arbejde — folk der søger et job",
    "Fritid og kurser — folk der søger en aktivitet",
    "Transport — folk der søger en bil, cykel eller samkørsel",
    "Ferie — folk der søger et sted at rejse hen",
    "Uddannelse — folk der søger et kursus eller en skole",
  ],
  reading_task_2_wrong_sentence: [
    "En dag på en arbejdsplads",
    "En familie i hverdagen",
    "Sundhed og motion",
    "Indkøb og penge",
    "En rejse eller en ferie",
    "At begynde på noget nyt",
  ],
  reading_task_3_missing_words: [
    "Transport og trafik i Danmark",
    "Mad og måltider",
    "Fritid og foreningsliv",
    "Arbejdsliv i Danmark",
    "Vejret og årstiderne",
    "At bo til leje",
  ],
  reading_task_4_people_matching: [
    "Tre personer fortæller om deres arbejde",
    "Tre personer fortæller om deres fritid",
    "Tre personer fortæller om at flytte til Danmark",
    "Tre personer fortæller om deres uddannelse",
    "Tre personer fortæller om deres bolig",
    "Tre personer fortæller om deres familie",
  ],
  writing_email: ["Bolig", "Ferie", "Arbejde", "Familie og besøg", "Fritid", "Sundhed"],
  writing_message: ["Naboer", "Arbejde", "Børn og skole", "Aftaler"],
  writing_short_text: ["Din by", "Din hverdag", "Din uddannelse", "En god oplevelse"],
  speaking_interview: ["Hverdagsliv", "Arbejde og uddannelse", "Familie", "Fritid", "Mad", "Transport"],
  speaking_topic: ["Bolig", "Din familie", "Din fritid", "Din by"],
  speaking_situation: ["Lave en aftale", "Købe noget", "Spørge om hjælp", "Booke en tid"],
  // Modul 2 opgaver. The mindmap topics mirror the ones the printed test
  // uses — work, placement, study, language school, housing, leisure — and the
  // generator writes the keyword categories to fit whichever it draws.
  speaking_mindmap: [
    "Mit arbejde",
    "Min praktik",
    "Mit studie",
    "Min sprogskole",
    "Min bolig",
    "Min fritidsaktivitet",
  ],
  speaking_information_gap: [
    "En kollega og hans arbejde",
    "En vens fritid",
    "Et kursus på aftenskolen",
    "En lejlighed, der er til leje",
    "En fest, I skal til",
  ],
  // Modul 3 opgaver.
  speaking_prepared_topic: [
    "Arbejde og uddannelse",
    "Familie og venner",
    "Sundhed og motion",
    "At bo i Danmark",
    "Fritid og interesser",
  ],
  speaking_picture_preference: [
    "Ferieformer",
    "Transport til arbejde",
    "Måder at bo på",
    "Fritidsaktiviteter",
    "Måder at lære dansk på",
  ],
};

function pickTopic(taskType: TaskType, usedTopics: string[]): string {
  const pool = TOPICS[taskType] ?? ["Hverdagsliv"];
  const unused = pool.filter((t) => !usedTopics.includes(t));
  const from = unused.length > 0 ? unused : pool;
  return from[Math.floor(Math.random() * from.length)];
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

function shortTopic(topic: string): string {
  return topic.split(" — ")[0];
}

function newVariantId(taskType: TaskType): string {
  return `gen-${taskType.replace(/[^a-z0-9]/gi, "").slice(0, 12)}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

const READING_INSTRUCTIONS: Record<string, (title: string) => string[]> = {
  reading_task_1_matching: () => [
    "Læs de små tekster om personerne (1-4).",
    "Find den annonce (B-G), der passer til hver tekst.",
    "Der er to annoncer, du ikke skal bruge.",
    "Se eksemplet (0).",
  ],
  reading_task_2_wrong_sentence: (title) => [
    `Læs teksten ${title}.`,
    "I hvert afsnit er der én sætning, der ikke passer i afsnittet.",
    "Find den sætning, der ikke passer.",
    "Se eksemplet i afsnit 0.",
  ],
  reading_task_3_missing_words: (title) => [
    `Læs teksten ${title}.`,
    "Skriv de ord, der mangler.",
    "Du skal kun bruge hvert ord én gang.",
    "Der er fire ord, du ikke skal bruge. Se eksemplet i første linje.",
  ],
  reading_task_4_people_matching: () => [
    "Læs de tre tekster, og læs spørgsmålene (1-5).",
    "Find den person, der passer til hvert af de fem spørgsmål.",
    "Sæt kryds ud for den person, der passer til spørgsmålet.",
    "Se eksemplet (0).",
  ],
};

/**
 * One generation attempt.
 *
 * Returns null rather than throwing, because the caller retries and then falls
 * back to the authored pool — a failure here is a normal branch, not an
 * exception. Which model runs this, how hard it thinks and how many tokens it
 * gets are all decided by the "exercise-generation" task in lib/ai/registry.ts.
 */
async function callModel(
  system: string,
  prompt: string,
  schema: Parameters<typeof generateStructured>[0]["schema"]
): Promise<{ object: unknown | null; reason?: string; retryable: boolean }> {
  return generateStructured({ task: "exercise-generation", schema, system, prompt });
}

/**
 * Builds the ExerciseVariant for one generated payload. Exported so the
 * mapping can be exercised against sample payloads without calling the API.
 */
export function toVariant(
  taskType: TaskType,
  category: ExerciseCategory,
  moduleId: number,
  topic: string,
  // Payload shape is checked by the Zod schema before we get here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gen: any
): ExerciseVariant {
  const base = {
    variantId: newVariantId(taskType),
    category,
    taskType,
    moduleId,
    topic: shortTopic(topic),
    title: gen.title as string,
    difficulty: "medium" as const,
  };

  switch (taskType) {
    case "reading_task_1_matching":
      return {
        ...base,
        instruction: READING_INSTRUCTIONS[taskType](gen.title),
        content: {
          kind: "reading_task_1_matching",
          example: gen.example,
          people: gen.people,
          ads: gen.ads,
          answers: Object.fromEntries(
            gen.answers.map((a: { personId: string; adId: string }) => [a.personId, a.adId])
          ),
          rationales: Object.fromEntries(
            gen.answers.map((a: { personId: string; rationale: string }) => [a.personId, a.rationale])
          ),
        },
      };

    case "reading_task_2_wrong_sentence":
      return {
        ...base,
        instruction: READING_INSTRUCTIONS[taskType](gen.textTitle),
        content: {
          kind: "reading_task_2_wrong_sentence",
          textTitle: gen.textTitle,
          example: gen.example,
          sections: gen.sections,
        },
      };

    case "reading_task_3_missing_words":
      return {
        ...base,
        instruction: READING_INSTRUCTIONS[taskType](gen.textTitle),
        content: {
          kind: "reading_task_3_missing_words",
          textTitle: gen.textTitle,
          textSegments: gen.textSegments,
          answers: gen.answers.map((a: { word: string }) => a.word),
          wordBank: gen.wordBank,
          exampleWord: gen.exampleWord,
          exampleSentence: gen.exampleSentence,
          rationales: gen.answers.map((a: { rationale: string }) => a.rationale),
        },
      };

    case "reading_task_4_people_matching":
      return {
        ...base,
        instruction: READING_INSTRUCTIONS[taskType](gen.heading),
        content: {
          kind: "reading_task_4_people_matching",
          heading: gen.heading,
          people: gen.people,
          example: gen.example,
          questions: gen.questions,
        },
      };

    case "writing_email":
    case "writing_message":
    case "writing_short_text":
      return {
        ...base,
        instruction: [
          gen.task,
          ...(gen.incomingEmail ? ["Du skal svare på alle spørgsmålene."] : []),
        ],
        content: {
          kind: "writing",
          situation: gen.situation,
          task: gen.task,
          minWords: gen.minWords,
          incomingEmail: gen.incomingEmail ?? undefined,
          answerHeader: gen.answerHeader
            ? { to: gen.answerHeader.to ?? undefined, subject: gen.answerHeader.subject ?? undefined }
            : undefined,
          mustInclude: gen.mustInclude,
        },
      };

    default: {
      // Stages come from the app's own task definitions, never from the model
      // — the format of an opgave is not something to regenerate each time.
      const stages = stagesForTaskType(taskType) ?? undefined;
      const instruction = stages
        ? stages.map((s) => s.instruction)
        : [
            "Læs spørgsmålene, og svar højt på dansk.",
            "Svar med hele sætninger, ikke kun ét ord.",
            "Prøv at tale i cirka to minutter i alt.",
          ];

      return {
        ...base,
        instruction,
        content: {
          kind: "speaking",
          situation: gen.situation ?? undefined,
          questions: gen.questions,
          followUps: gen.followUps,
          usefulPhrases: gen.usefulPhrases,
          stages,
          // Each of these is present only for the task type that generates it;
          // the rest stay undefined, which is what keeps the original speaking
          // prompts byte-identical to before.
          mindmap: gen.mindmap ?? undefined,
          informationGap: gen.informationGap ?? undefined,
          preparedTopics: gen.preparedTopics ?? undefined,
          preferenceTopic: gen.preferenceTopic ?? undefined,
          preferenceOptions: gen.preferenceOptions ?? undefined,
        },
      };
    }
  }
}

function promptFor(taskType: TaskType, topic: string, avoid: string[], moduleId: number): string {
  switch (taskType) {
    case "reading_task_1_matching":
      return task1Prompt(topic, avoid);
    case "reading_task_2_wrong_sentence":
      return task2Prompt(topic, avoid);
    case "reading_task_3_missing_words":
      return task3Prompt(topic, avoid);
    case "reading_task_4_people_matching":
      return task4Prompt(topic, avoid);
    case "writing_email":
    case "writing_message":
    case "writing_short_text":
      return writingPrompt(taskType, topic, avoid);
    case "speaking_mindmap":
      return mindmapPrompt(moduleId, topic, avoid);
    case "speaking_information_gap":
      return informationGapPrompt(moduleId, topic, avoid);
    case "speaking_prepared_topic":
      return preparedTopicPrompt(moduleId, topic, avoid);
    case "speaking_picture_preference":
      return picturePreferencePrompt(moduleId, topic, avoid);
    default:
      return speakingPrompt(taskType, topic, avoid);
  }
}

function schemaFor(taskType: TaskType) {
  switch (taskType) {
    case "reading_task_1_matching":
      return Task1Schema;
    case "reading_task_2_wrong_sentence":
      return Task2Schema;
    case "reading_task_3_missing_words":
      return Task3Schema;
    case "reading_task_4_people_matching":
      return Task4Schema;
    case "writing_email":
    case "writing_message":
    case "writing_short_text":
      return WritingSchema;
    case "speaking_mindmap":
      return MindmapSchema;
    case "speaking_information_gap":
      return InformationGapSchema;
    case "speaking_prepared_topic":
      return PreparedTopicSchema;
    case "speaking_picture_preference":
      return PicturePreferenceSchema;
    default:
      return SpeakingSchema;
  }
}

export interface GenerationOutcome {
  variant: ExerciseVariant | null;
  /** Why generation didn't produce a usable exercise, for logging. */
  reason?: string;
}

/**
 * Generates one exercise. Returns null (with a reason) rather than throwing —
 * the caller falls back to the authored pool so a missing key or a bad night
 * for the API never blocks practice.
 */
export async function generateExercise(
  taskType: TaskType,
  category: ExerciseCategory,
  moduleId: number,
  usedTopics: string[],
  attempts = 2
): Promise<GenerationOutcome> {
  if (!llmGenerationAvailable()) {
    return {
      variant: null,
      reason: "no AI provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)",
    };
  }

  const schema = schemaFor(taskType);
  const problems: string[] = [];

  for (let i = 0; i < attempts; i++) {
    const topic = pickTopic(taskType, usedTopics);
    let prompt = promptFor(taskType, topic, usedTopics.map(shortTopic), moduleId);

    // On the retry, tell the model exactly what was wrong last time.
    if (problems.length > 0) {
      prompt += `\n\nDIT FORRIGE FORSØG BLEV AFVIST. Ret disse fejl:\n${problems
        .map((p) => `- ${p}`)
        .join("\n")}`;
    }

    try {
      const call = await callModel(SYSTEM, prompt, schema);
      if (!call.object) {
        problems.push(call.reason ?? "modellen returnerede intet brugbart svar");
        // A missing key, a rejected key or a malformed request will not fix
        // itself on the second attempt — stop and let the caller fall back to
        // the authored pool rather than burning the retry on a certainty.
        if (!call.retryable) break;
        continue;
      }

      const variant = toVariant(taskType, category, moduleId, topic, call.object);
      const check = validateVariant(variant);
      if (check.ok) return { variant };

      problems.length = 0;
      problems.push(...check.errors);
      console.warn(
        `[exercise-gen] ${taskType} attempt ${i + 1} failed validation:`,
        check.errors.join("; ")
      );
    } catch (err) {
      // Transport and provider failures are classified inside the AI layer and
      // come back on the outcome above, so anything reaching here is a throw
      // from toVariant or validateVariant — a shape the mapper did not expect.
      // Worth retrying: the next generation may well be well-formed.
      const msg = err instanceof Error ? err.message : "unknown error";
      console.warn(`[exercise-gen] ${taskType} attempt ${i + 1} threw:`, msg);
      problems.push(msg);
    }
  }

  return { variant: null, reason: problems.join("; ") || "generation failed" };
}
