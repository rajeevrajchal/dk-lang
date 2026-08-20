// Sentence-level breakdowns for the Modul 2 reading passages — the "why"
// layer of the Explain panel, sitting between the whole-passage English
// summary (modul2-glossary.ts) and the per-word glosses in the same file.
//
// Each sentence carries a structural note explaining the grammar actually at
// work in it, and the construct codes it demonstrates, so the panel can link
// straight to the theory lesson that teaches the rule
// (see lib/content-gen/theory.ts).
//
// Sentences are stored in their complete form. Gap-fill items blank one word
// out of the passage they render, but the breakdown always shows the whole
// sentence — seeing the intact structure is the point of the exercise here.

export interface SentenceBreakdown {
  danish: string;
  english: string;
  structureNote: string;
  constructCodes: string[]; // codes from constructs.ts demonstrated here
}

export interface PassageSentences {
  passageId: string;
  sentences: SentenceBreakdown[];
}

export const MODUL2_SENTENCES: PassageSentences[] = [
  {
    passageId: "m2-t1-arbejde-peter-hospital",
    sentences: [
      {
        danish: "Peter arbejder på et hospital i Odense.",
        english: "Peter works at a hospital in Odense.",
        structureNote:
          "Textbook main clause: subject (Peter) first, verb (arbejder) second. 'arbejder' is the present tense of 'at arbejde' — the same form for every person.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Han starter på arbejde klokken syv om morgenen.",
        english: "He starts work at seven in the morning.",
        structureNote:
          "Still subject–verb–rest. 'klokken' + a number is the fixed way to tell the time, and 'om morgenen' uses the definite form to mean 'in the morning' generally.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Om dagen hjælper han patienterne, og han taler med lægerne.",
        english: "During the day he helps the patients, and he talks to the doctors.",
        structureNote:
          "First clause starts with the time phrase 'Om dagen', so the verb must still be second — that's why it reads 'hjælper han', not 'han hjælper'. After 'og' the second clause starts fresh with normal subject–verb order.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Klokken tolv holder Peter pause og spiser frokost i kantinen.",
        english: "At twelve o'clock Peter takes a break and eats lunch in the canteen.",
        structureNote:
          "Same inversion again: the time phrase is first, so 'holder Peter'. Both verbs share the one subject, so 'og' just joins the two verb phrases.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Det er hårdt, men det er også spændende.",
        english: "It's hard, but it's also exciting.",
        structureNote:
          "'men' signals contrast — that's what distinguishes it from 'og'. 'hårdt' carries a -t because it describes the neuter pronoun 'det'; 'spændende' never changes form.",
        constructCodes: ["coordination:og-men-eller"],
      },
    ],
  },
  {
    passageId: "m2-t1-uddannelse-maria-sprogskole",
    sentences: [
      {
        danish: "Maria går på sprogskole tre gange om ugen.",
        english: "Maria goes to language school three times a week.",
        structureNote:
          "Subject–verb–rest. 'går på sprogskole' is the idiom for attending a school, and 'om ugen' (definite form) means 'per week'.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Hun læser dansk om morgenen, og hun laver lektier om aftenen.",
        english: "She reads Danish in the morning, and she does homework in the evening.",
        structureNote:
          "Two balanced main clauses joined by 'og'. Neither inverts, because each starts with its own subject. Note 'laver lektier' — Danish 'makes' homework.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "I klassen er der elever fra mange lande.",
        english: "In the class there are students from many countries.",
        structureNote:
          "'der er' is the 'there is/are' construction. The place phrase is fronted, so the verb 'er' comes before 'der'.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Læreren taler langsomt, og eleverne øver sig sammen.",
        english: "The teacher speaks slowly, and the students practice together.",
        structureNote:
          "'langsomt' is the adjective 'langsom' plus -t, doing adverb duty. 'øver sig' is reflexive — the 'sig' is required and doesn't translate into English.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Sprogskolen er sjov, men den er også svær.",
        english: "The language school is fun, but it is also difficult.",
        structureNote:
          "Contrast, so 'men'. 'sjov' and 'svær' both stay in base form because 'sprogskolen' is an en-word; 'den' is the pronoun that refers back to an en-word.",
        constructCodes: ["coordination:og-men-eller"],
      },
    ],
  },
  {
    passageId: "m2-t1-hverdagsliv-familien-nielsen",
    sentences: [
      {
        danish: "Familien Nielsen bor i en lejlighed i København.",
        english: "The Nielsen family lives in an apartment in Copenhagen.",
        structureNote:
          "Subject–verb–rest. 'Familien' is already definite (familie + -n), which is why there's no separate word for 'the'.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Om morgenen står de tidligt op, og de spiser morgenmad sammen.",
        english: "In the morning they get up early, and they eat breakfast together.",
        structureNote:
          "Fronted time phrase forces 'står de'. 'står ... op' is a separable phrasal verb — the 'op' lands after the adverb 'tidligt'.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Børnene cykler i skole, og forældrene tager bussen på arbejde.",
        english: "The children bike to school, and the parents take the bus to work.",
        structureNote:
          "Two parallel main clauses. 'i skole' and 'på arbejde' drop the article — fixed expressions, like English 'to school' and 'at work'. 'Børnene' is an irregular definite plural (barn → børn → børnene).",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Weekenden bruger familien i parken eller hjemme.",
        english: "The family spends the weekend in the park or at home.",
        structureNote:
          "The object 'Weekenden' is fronted for emphasis, so the order is object–verb–subject. 'eller' offers the alternative between the two places.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
    ],
  },
  {
    passageId: "m2-t1-medborgerskab-folketinget",
    sentences: [
      {
        danish: "I Danmark er der valg til Folketinget hvert fjerde år.",
        english: "In Denmark there are elections to the Folketing every four years.",
        structureNote:
          "Fronted place phrase, so 'er der' rather than 'der er'. 'hvert' takes -t to agree with the neuter noun 'år'.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Alle borgere over atten år har stemmeret.",
        english: "All citizens over eighteen have the right to vote.",
        structureNote:
          "Subject–verb–object, with the long subject phrase 'Alle borgere over atten år' counting as a single element in position 1.",
        constructCodes: ["present-tense"],
      },
      {
        danish: "Mange danskere følger med i nyhederne, og de taler om politik med familie og venner.",
        english: "Many Danes follow the news, and they talk about politics with family and friends.",
        structureNote:
          "'og' links two facts that are both simply true — no contrast, so not 'men'. 'følger med i' is a fixed phrase meaning 'keep up with'.",
        constructCodes: ["present-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Stemmeret er en vigtig ret i et demokrati.",
        english: "The right to vote is an important right in a democracy.",
        structureNote:
          "'vigtig' stays in base form because 'ret' is an en-word and the phrase is indefinite. Compare 'et vigtigt valg', where the et-word would force -t.",
        constructCodes: ["present-tense"],
      },
    ],
  },
  {
    passageId: "m2-t2-arbejde-peter-jobskift",
    sentences: [
      {
        danish: "Sidste år skiftede Peter job, fordi han ville arbejde tættere på sit hjem.",
        english: "Last year Peter changed jobs, because he wanted to work closer to home.",
        structureNote:
          "Fronted time phrase → 'skiftede Peter'. 'fordi' opens a subordinate clause giving the reason. 'ville' is the past of the modal 'vil' and means 'wanted to', not 'would'. 'sit' is the reflexive possessive: his own home.",
        constructCodes: ["past-tense", "subordinate-clause:fordi", "modal-verb"],
      },
      {
        danish: "Han søgte en stilling på et hospital i sin egen by, og han fik jobbet efter en samtale.",
        english: "He applied for a position at a hospital in his own town, and he got the job after an interview.",
        structureNote:
          "Two past-tense main clauses joined by 'og'. 'søgte' is a -te past; 'fik' is the irregular past of 'at få'.",
        constructCodes: ["past-tense", "coordination:og-men-eller"],
      },
      {
        danish:
          "I den nye stilling arbejdede han med de samme opgaver som før, men transporttiden blev meget kortere.",
        english:
          "In the new position he worked on the same tasks as before, but the commute became much shorter.",
        structureNote:
          "Fronted phrase → 'arbejdede han'. 'den nye stilling' shows the definite pattern: separate 'den' plus -e on the adjective, and no suffix on the noun. 'kortere' is the comparative of 'kort'.",
        constructCodes: ["past-tense", "coordination:og-men-eller"],
      },
      {
        danish: "Peter var glad for skiftet, fordi han nu havde mere tid til familien.",
        english: "Peter was happy about the change, because he now had more time for his family.",
        structureNote:
          "'fordi' again marks the reason. Inside that subordinate clause the adverb 'nu' sits in front of the verb ('han nu havde'), which is the giveaway that it's a ledsætning and not a main clause.",
        constructCodes: ["past-tense", "subordinate-clause:fordi"],
      },
    ],
  },
  {
    passageId: "m2-t2-uddannelse-maria-modultest",
    sentences: [
      {
        danish: "Maria vil gerne bestå modultesten, og hun håber, at hun kan læse bedre dansk om et halvt år.",
        english:
          "Maria wants to pass the modultest, and she hopes that she can read Danish better in six months.",
        structureNote:
          "'vil gerne' = 'would like to'; the modal takes the bare infinitive 'bestå' with no 'at'. Then 'håber, at ...' opens a content clause reporting what she hopes. 'kan' is another modal, again with a bare infinitive.",
        constructCodes: ["modal-verb", "subordinate-clause:at", "coordination:og-men-eller"],
      },
      {
        danish: "Hendes lærer siger, at Maria skal øve sig hver dag for at blive bedre.",
        english: "Her teacher says that Maria has to practice every day in order to get better.",
        structureNote:
          "'siger, at ...' — verbs of saying and thinking take an at-clause. 'skal' is obligation here. 'for at + infinitive' expresses purpose ('in order to').",
        constructCodes: ["subordinate-clause:at", "modal-verb"],
      },
      {
        danish: "Maria tror, at hun kan nå sit mål, hvis hun arbejder hårdt.",
        english: "Maria believes that she can reach her goal if she works hard.",
        structureNote:
          "Two stacked subordinate clauses: an at-clause after 'tror', and a hvis-clause stating the condition inside it. 'hårdt' is the adverb form of 'hård'.",
        constructCodes: ["subordinate-clause:at", "modal-verb"],
      },
      {
        danish: "Hun skal snart til en ny test.",
        english: "She has a new test coming up soon.",
        structureNote:
          "'skal' with no following verb at all — a common Danish pattern where a movement verb is understood: 'skal til' means 'is going to / is due for'. This is the future-as-arrangement use.",
        constructCodes: ["modal-verb"],
      },
    ],
  },
  {
    passageId: "m2-t2-hverdagsliv-familien-flytter",
    sentences: [
      {
        danish: "Familien Nielsen boede før i en lille lejlighed.",
        english: "The Nielsen family used to live in a small apartment.",
        structureNote:
          "'boede' is a regular -ede past. 'før' here is the adverb 'previously', not the conjunction 'before'. 'lille' is irregular — it never takes -t or -e in the singular.",
        constructCodes: ["past-tense"],
      },
      {
        danish: "Køkkenet var meget lille, og når de lavede mad sammen, stod de tæt op ad hinanden.",
        english: "The kitchen was very small, and when they cooked together, they stood close to each other.",
        structureNote:
          "After 'og' comes a når-clause placed first in its own clause — so the main clause that follows inverts: 'stod de', not 'de stod'. 'når' signals a repeated situation, not one specific occasion.",
        constructCodes: ["past-tense", "subordinate-clause:naar", "coordination:og-men-eller"],
      },
      {
        danish: "De flyttede sidste sommer til en større lejlighed.",
        english: "They moved last summer to a bigger apartment.",
        structureNote:
          "Plain past-tense main clause. 'større' is the irregular comparative of 'stor'.",
        constructCodes: ["past-tense"],
      },
      {
        danish: "Nu, når de spiser aftensmad, sidder de alle ved et stort bord.",
        english: "Now, when they eat dinner, they all sit at a big table.",
        structureNote:
          "The når-clause occupies position 1, so the main verb comes before its subject: 'sidder de'. 'stort' takes -t because 'bord' is an et-word.",
        constructCodes: ["subordinate-clause:naar"],
      },
      {
        danish: "Børnene var glade for de nye værelser.",
        english: "The children were happy about the new rooms.",
        structureNote:
          "'glade' takes -e because the subject is plural. 'de nye værelser' shows the definite plural pattern: 'de' + adjective with -e, noun without a suffix.",
        constructCodes: ["past-tense"],
      },
    ],
  },
  {
    passageId: "m2-t2-medborgerskab-skat",
    sentences: [
      {
        danish: "Alle borgere i Danmark skal betale skat, fordi skatten betaler for skoler, hospitaler og veje.",
        english:
          "All citizens in Denmark must pay tax, because the tax pays for schools, hospitals and roads.",
        structureNote:
          "'skal' expresses obligation and takes the bare infinitive 'betale'. The fordi-clause gives the reason. Note 'skat' (indefinite, tax in general) versus 'skatten' (definite, that tax specifically).",
        constructCodes: ["modal-verb", "subordinate-clause:fordi"],
      },
      {
        danish: "Man må gerne sige sin mening offentligt, fordi Danmark har ytringsfrihed.",
        english: "You may freely express your opinion publicly, because Denmark has freedom of speech.",
        structureNote:
          "'må gerne' is unambiguous permission — without 'gerne', 'må' could be read as necessity. 'man' is the impersonal 'one/you in general'. 'sin' refers back to 'man'.",
        constructCodes: ["modal-verb", "subordinate-clause:fordi"],
      },
      {
        danish:
          "Nye borgere skal lære om det danske samfund, og de bør deltage i lokale valg, når de har mulighed for det.",
        english:
          "New citizens must learn about Danish society, and they ought to take part in local elections when they have the opportunity.",
        structureNote:
          "Two modals contrasted: 'skal' (requirement) then 'bør' (recommendation) — a real difference in strength. The når-clause comes last here, so no inversion is triggered.",
        constructCodes: ["modal-verb", "subordinate-clause:naar", "coordination:og-men-eller"],
      },
      {
        danish: "Mange mener, at medborgerskab handler om at tage ansvar.",
        english: "Many think that citizenship is about taking responsibility.",
        structureNote:
          "'mener, at ...' takes a content clause. The second 'at' is different — it's the infinitive marker in 'at tage', equivalent to English 'to take'.",
        constructCodes: ["subordinate-clause:at"],
      },
    ],
  },
  {
    passageId: "m2-t3-arbejde-hospital-passiv",
    sentences: [
      {
        danish: "På hospitalet bliver patienterne undersøgt af en læge, før de bliver indlagt.",
        english: "At the hospital the patients are examined by a doctor before they are admitted.",
        structureNote:
          "Two passives with 'bliver' + past participle. The thing being acted on ('patienterne') is the subject; 'af en læge' names who actually does it. Fronted 'På hospitalet' forces 'bliver patienterne'.",
        constructCodes: ["passive-voice"],
      },
      {
        danish: "Reglerne for hygiejne overholdes strengt af alt personale, fordi risikoen for infektioner ellers stiger.",
        english:
          "The hygiene rules are strictly observed by all staff, because the risk of infection otherwise rises.",
        structureNote:
          "This is the other passive: -s attached straight to the verb ('overholdes'), preferred in formal writing and for standing rules. The fordi-clause explains why.",
        constructCodes: ["passive-voice", "subordinate-clause:fordi"],
      },
      {
        danish: "Der er for få sygeplejersker i øjeblikket, og derfor bliver mange vagter dækket af vikarer.",
        english: "There are too few nurses at the moment, and therefore many shifts are covered by temps.",
        structureNote:
          "'derfor' introduces the consequence — the opposite direction from 'fordi', which introduces the cause. Because 'derfor' sits first in its clause, the verb comes before the subject: 'bliver mange vagter'.",
        constructCodes: ["connector:derfor", "passive-voice"],
      },
      {
        danish: "Ledelsen har derfor besluttet at ansætte flere fastansatte i det næste år.",
        english: "Management has therefore decided to hire more permanent staff in the coming year.",
        structureNote:
          "Present perfect: 'har' + participle 'besluttet', used because the decision still stands. Here 'derfor' sits inside the clause rather than at the front, so no inversion.",
        constructCodes: ["connector:derfor"],
      },
    ],
  },
  {
    passageId: "m2-t3-uddannelse-maria-grammatik",
    sentences: [
      {
        danish:
          "Selvom Maria synes, at grammatik er svær, øver hun sig hver dag, fordi hun ved, at det hjælper hende til at blive bedre.",
        english:
          "Even though Maria finds grammar difficult, she practices every day, because she knows that it helps her get better.",
        structureNote:
          "Four clauses. Main clause: 'øver hun sig hver dag' — inverted because the whole selvom-clause fills position 1. Inside the selvom-clause sits an at-clause; inside the fordi-clause sits another at-clause. Find the main clause first, then hang the rest off it.",
        constructCodes: ["multiple-subordinate-clauses", "connector:selvom", "subordinate-clause:fordi", "subordinate-clause:at"],
      },
      {
        danish: "Hendes lærer forklarer, at man lærer mest, når man både lytter og taler.",
        english: "Her teacher explains that you learn most when you both listen and speak.",
        structureNote:
          "An at-clause with a når-clause nested inside it. 'både ... og' is a fixed pair meaning 'both ... and'. Watch the two similar words: 'lærer' as a noun is 'teacher', as a verb it's 'learns'.",
        constructCodes: ["multiple-subordinate-clauses", "subordinate-clause:at", "subordinate-clause:naar"],
      },
      {
        danish:
          "Selvom nogle elever er nervøse for at tale foran klassen, siger læreren, at det er den bedste måde at lære på.",
        english:
          "Even though some students are nervous about speaking in front of the class, the teacher says it's the best way to learn.",
        structureNote:
          "Fronted selvom-clause → 'siger læreren' inverts. 'nervøse' takes -e for the plural subject. 'den bedste' is the definite superlative of 'god'.",
        constructCodes: ["connector:selvom", "subordinate-clause:at"],
      },
    ],
  },
  {
    passageId: "m2-t3-hverdagsliv-lejlighed-flytning",
    sentences: [
      {
        danish: "Den nye lejlighed bliver malet af et malerfirma, før familien flytter ind.",
        english: "The new apartment is being painted by a painting company before the family moves in.",
        structureNote:
          "Passive with 'bliver' + 'malet'; 'af et malerfirma' names the agent. 'Den nye lejlighed' is the definite-with-adjective pattern — 'den' plus -e, no suffix on the noun.",
        constructCodes: ["passive-voice"],
      },
      {
        danish: "Møblerne bliver kørt derhen af et flyttefirma i næste uge.",
        english: "The furniture is being transported there by a moving company next week.",
        structureNote:
          "Another 'bliver' passive. 'Møblerne' is an irregular definite plural (møbel → møbler → møblerne). Present tense with 'i næste uge' does the work of a future tense.",
        constructCodes: ["passive-voice"],
      },
      {
        danish: "Det hele bliver dyrere, end familien havde regnet med.",
        english: "The whole thing is turning out more expensive than the family had expected.",
        structureNote:
          "'dyrere' is a comparative, so the comparison is introduced by 'end'. 'havde regnet med' is past perfect — expectation formed before the events described.",
        constructCodes: [],
      },
      {
        danish: "De er dog glade for den nye lejlighed, fordi den ligger tæt på børnenes skole.",
        english: "They're happy with the new apartment even so, because it's close to the children's school.",
        structureNote:
          "'dog' sits inside the clause and softens the contrast with the previous sentence about cost. 'børnenes' is a genitive built on the definite plural: børnene + -s.",
        constructCodes: ["connector:dog", "subordinate-clause:fordi"],
      },
    ],
  },
  {
    passageId: "m2-t3-medborgerskab-nye-borgere",
    sentences: [
      {
        danish:
          "Selvom mange nye borgere synes, at det danske system er svært at forstå i starten, bliver de fleste bedre til det, når de har boet i landet i nogle år.",
        english:
          "Even though many new citizens find the Danish system hard to understand at first, most get better at it once they've lived in the country for a few years.",
        structureNote:
          "Main clause: 'bliver de fleste bedre til det' — inverted after the fronted selvom-clause. An at-clause sits inside the selvom-clause, and a når-clause follows the main clause. 'svært' takes -t to agree with the neuter 'system'.",
        constructCodes: ["multiple-subordinate-clauses", "connector:selvom", "subordinate-clause:at", "subordinate-clause:naar"],
      },
      {
        danish:
          "Kommunen tilbyder kurser, hvor man kan lære om rettigheder og pligter, fordi det er vigtigt, at alle forstår, hvordan samfundet fungerer.",
        english:
          "The municipality offers courses where you can learn about rights and duties, because it's important that everyone understands how society works.",
        structureNote:
          "Clauses stacked four deep: a hvor-clause describing the courses, then a fordi-clause, then an at-clause inside it, then a hvordan-clause inside that. Each comma marks a boundary — use them as your map.",
        constructCodes: ["multiple-subordinate-clauses", "subordinate-clause:fordi", "subordinate-clause:at"],
      },
      {
        danish: "Selvom kurserne er frivillige, deltager mange, fordi de gerne vil forstå deres nye hjemland bedre.",
        english:
          "Even though the courses are voluntary, many take part, because they want to understand their new home country better.",
        structureNote:
          "Fronted selvom-clause → 'deltager mange' inverts. 'vil' here is intention, not prediction: 'want to understand'. 'frivillige' takes -e agreeing with the definite plural 'kurserne'.",
        constructCodes: ["connector:selvom", "subordinate-clause:fordi", "modal-verb"],
      },
    ],
  },
];

export const SENTENCES_BY_PASSAGE_ID = new Map(
  MODUL2_SENTENCES.map((p) => [p.passageId, p.sentences])
);
