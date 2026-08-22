import type { GeneratedReadingItem } from "./types";

// Modul 2 reading (læsning) item bank — tiers 1-3.
//
// Tier 4 (abstract/argumentative, B2/PD3 band) is intentionally not
// generated here: it doesn't belong in Modul 2's difficulty ceiling per the
// module map (see lib/curriculum/modules.ts) and is reserved for Modul
// 4/5 content. All passages are original, level-calibrated compositions —
// never sourced from or resembling the real SIRI test bank. See
// docs/content-validation.md.
//
// Each passage deliberately isolates 1-2 target constructs so per-construct
// accuracy tracking stays meaningful (a learner missing the "fordi" gap-fill
// tells you something specific, not just "reading is weak").
//
// `passageId` is a stable, hand-assigned key shared by every item built on
// the same passage (including its gap-fill variant, which drops one word).
// It survives `db:seed`/`db:reset` re-runs, unlike `Item.id` (a fresh
// cuid() every time) — see lib/content-gen/modul2-glossary.ts, which is
// keyed on it for the word/paragraph translation helper.

export const MODUL2_READING_ITEMS: GeneratedReadingItem[] = [
  // ---------------------------------------------------------------------
  // TIER 1 — present tense, simple coordination (og/men/eller)
  // ---------------------------------------------------------------------
  {
    tier: 1,
    topic: "ARBEJDE",
    constructs: ["present-tense"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t1-arbejde-peter-hospital",
    passageText:
      "Peter arbejder på et hospital i Odense. Han er sygeplejerske. Han starter på arbejde klokken syv om morgenen. Om dagen hjælper han patienterne, og han taler med lægerne. Klokken tolv holder Peter pause og spiser frokost i kantinen. Peter er glad for sit arbejde. Det er hårdt, men det er også spændende.",
    promptText: "Hvor arbejder Peter?",
    options: ["På et hospital", "På en skole", "I en butik", "På en restaurant"],
    answer: ["På et hospital"],
    explanation: "Teksten siger direkte: 'Peter arbejder på et hospital i Odense.'",
  },
  {
    tier: 1,
    topic: "ARBEJDE",
    constructs: ["present-tense"],
    type: "TRUE_FALSE",
    passageId: "m2-t1-arbejde-peter-hospital",
    passageText:
      "Peter arbejder på et hospital i Odense. Han er sygeplejerske. Han starter på arbejde klokken syv om morgenen. Om dagen hjælper han patienterne, og han taler med lægerne. Klokken tolv holder Peter pause og spiser frokost i kantinen. Peter er glad for sit arbejde. Det er hårdt, men det er også spændende.",
    promptText: "Peter spiser frokost klokken tolv.",
    options: ["Sandt", "Falsk"],
    answer: ["Sandt"],
    explanation: "'Klokken tolv holder Peter pause og spiser frokost i kantinen.'",
  },
  {
    tier: 1,
    topic: "ARBEJDE",
    constructs: ["coordination:og-men-eller"],
    type: "GAP_FILL",
    passageId: "m2-t1-arbejde-peter-hospital",
    passageText:
      "Peter arbejder på et hospital i Odense. Han er sygeplejerske. Han starter på arbejde klokken syv om morgenen. Om dagen hjælper han patienterne, og han taler med lægerne. Klokken tolv holder Peter pause og spiser frokost i kantinen. Peter er glad for sit arbejde. Det er hårdt, ___ det er også spændende.",
    promptText: "Udfyld det manglende ord.",
    options: ["og", "men", "eller"],
    answer: ["men"],
    explanation: "'Men' bruges, fordi de to dele af sætningen står i kontrast til hinanden.",
  },

  {
    tier: 1,
    topic: "UDDANNELSE",
    constructs: ["present-tense"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t1-uddannelse-maria-sprogskole",
    passageText:
      "Maria går på sprogskole tre gange om ugen. Hun læser dansk om morgenen, og hun laver lektier om aftenen. I klassen er der elever fra mange lande. Læreren taler langsomt, og eleverne øver sig sammen. Sprogskolen er sjov, men den er også svær.",
    promptText: "Hvor mange gange om ugen går Maria på sprogskole?",
    options: ["Tre gange", "En gang", "Fem gange", "To gange"],
    answer: ["Tre gange"],
    explanation: "'Maria går på sprogskole tre gange om ugen.'",
  },
  {
    tier: 1,
    topic: "UDDANNELSE",
    constructs: ["present-tense"],
    type: "TRUE_FALSE",
    passageId: "m2-t1-uddannelse-maria-sprogskole",
    passageText:
      "Maria går på sprogskole tre gange om ugen. Hun læser dansk om morgenen, og hun laver lektier om aftenen. I klassen er der elever fra mange lande. Læreren taler langsomt, og eleverne øver sig sammen. Sprogskolen er sjov, men den er også svær.",
    promptText: "Læreren taler hurtigt.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "'Læreren taler langsomt', ikke hurtigt.",
  },
  {
    tier: 1,
    topic: "UDDANNELSE",
    constructs: ["coordination:og-men-eller"],
    type: "GAP_FILL",
    passageId: "m2-t1-uddannelse-maria-sprogskole",
    passageText:
      "Maria går på sprogskole tre gange om ugen. Hun læser dansk om morgenen, og hun laver lektier om aftenen. I klassen er der elever fra mange lande. Læreren taler langsomt, og eleverne øver sig sammen. Sprogskolen er sjov, ___ den er også svær.",
    promptText: "Udfyld det manglende ord.",
    options: ["og", "men", "eller"],
    answer: ["men"],
    explanation: "Kontrast mellem 'sjov' og 'svær' kræver 'men'.",
  },

  {
    tier: 1,
    topic: "HVERDAGSLIV",
    constructs: ["present-tense"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t1-hverdagsliv-familien-nielsen",
    passageText:
      "Familien Nielsen bor i en lejlighed i København. Om morgenen står de tidligt op, og de spiser morgenmad sammen. Børnene cykler i skole, og forældrene tager bussen på arbejde. Om aftenen laver de mad, og de ser fjernsyn sammen. Weekenden bruger familien i parken eller hjemme.",
    promptText: "Hvordan kommer børnene i skole?",
    options: ["De cykler", "De tager bussen", "De går", "De kører i bil"],
    answer: ["De cykler"],
    explanation: "'Børnene cykler i skole, og forældrene tager bussen på arbejde.'",
  },
  {
    tier: 1,
    topic: "HVERDAGSLIV",
    constructs: ["present-tense"],
    type: "TRUE_FALSE",
    passageId: "m2-t1-hverdagsliv-familien-nielsen",
    passageText:
      "Familien Nielsen bor i en lejlighed i København. Om morgenen står de tidligt op, og de spiser morgenmad sammen. Børnene cykler i skole, og forældrene tager bussen på arbejde. Om aftenen laver de mad, og de ser fjernsyn sammen. Weekenden bruger familien i parken eller hjemme.",
    promptText: "Familien Nielsen bor i et hus.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "De bor i 'en lejlighed', ikke et hus.",
  },
  {
    tier: 1,
    topic: "HVERDAGSLIV",
    constructs: ["coordination:og-men-eller"],
    type: "MATCHING",
    passageId: "m2-t1-hverdagsliv-familien-nielsen",
    passageText:
      "Familien Nielsen bor i en lejlighed i København. Om morgenen står de tidligt op, og de spiser morgenmad sammen. Børnene cykler i skole, og forældrene tager bussen på arbejde. Om aftenen laver de mad, og de ser fjernsyn sammen. Weekenden bruger familien i parken eller hjemme.",
    promptText: "Match personen med, hvordan de kommer af sted.",
    options: { left: ["Børnene", "Forældrene"], right: ["Tager bussen på arbejde", "Cykler i skole"] },
    answer: ["0:1", "1:0"],
    explanation: "Børnene cykler i skole; forældrene tager bussen på arbejde.",
  },

  {
    tier: 1,
    topic: "MEDBORGERSKAB",
    constructs: ["present-tense"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t1-medborgerskab-folketinget",
    passageText:
      "I Danmark er der valg til Folketinget hvert fjerde år. Alle borgere over atten år har stemmeret. Mange danskere følger med i nyhederne, og de taler om politik med familie og venner. Stemmeret er en vigtig ret i et demokrati.",
    promptText: "Hvor ofte er der valg til Folketinget?",
    options: ["Hvert fjerde år", "Hvert andet år", "Hvert år", "Hvert femte år"],
    answer: ["Hvert fjerde år"],
    explanation: "'Der er valg til Folketinget hvert fjerde år.'",
  },
  {
    tier: 1,
    topic: "MEDBORGERSKAB",
    constructs: ["present-tense"],
    type: "TRUE_FALSE",
    passageId: "m2-t1-medborgerskab-folketinget",
    passageText:
      "I Danmark er der valg til Folketinget hvert fjerde år. Alle borgere over atten år har stemmeret. Mange danskere følger med i nyhederne, og de taler om politik med familie og venner. Stemmeret er en vigtig ret i et demokrati.",
    promptText: "Man skal være atten år for at have stemmeret.",
    options: ["Sandt", "Falsk"],
    answer: ["Sandt"],
    explanation: "'Alle borgere over atten år har stemmeret.'",
  },
  {
    tier: 1,
    topic: "MEDBORGERSKAB",
    constructs: ["coordination:og-men-eller"],
    type: "GAP_FILL",
    passageId: "m2-t1-medborgerskab-folketinget",
    passageText:
      "I Danmark er der valg til Folketinget hvert fjerde år. Alle borgere over atten år har stemmeret. Mange danskere følger med i nyhederne, ___ de taler om politik med familie og venner. Stemmeret er en vigtig ret i et demokrati.",
    promptText: "Udfyld det manglende ord.",
    options: ["og", "men", "eller"],
    answer: ["og"],
    explanation: "To handlinger, der begge er sande, forbindes med 'og'.",
  },

  // ---------------------------------------------------------------------
  // TIER 2 — past tense, modal verbs, one subordinate clause
  // ---------------------------------------------------------------------
  {
    tier: 2,
    topic: "ARBEJDE",
    constructs: ["subordinate-clause:fordi"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t2-arbejde-peter-jobskift",
    passageText:
      "Sidste år skiftede Peter job, fordi han ville arbejde tættere på sit hjem. Han søgte en stilling på et hospital i sin egen by, og han fik jobbet efter en samtale. I den nye stilling arbejdede han med de samme opgaver som før, men transporttiden blev meget kortere. Peter var glad for skiftet, fordi han nu havde mere tid til familien.",
    promptText: "Hvorfor skiftede Peter job?",
    options: [
      "Fordi han ville arbejde tættere på sit hjem",
      "Fordi han fik mere i løn",
      "Fordi han ville prøve noget nyt",
      "Fordi hospitalet lukkede",
    ],
    answer: ["Fordi han ville arbejde tættere på sit hjem"],
    explanation: "'Peter skiftede job, fordi han ville arbejde tættere på sit hjem.'",
  },
  {
    tier: 2,
    topic: "ARBEJDE",
    constructs: ["past-tense"],
    type: "TRUE_FALSE",
    passageId: "m2-t2-arbejde-peter-jobskift",
    passageText:
      "Sidste år skiftede Peter job, fordi han ville arbejde tættere på sit hjem. Han søgte en stilling på et hospital i sin egen by, og han fik jobbet efter en samtale. I den nye stilling arbejdede han med de samme opgaver som før, men transporttiden blev meget kortere. Peter var glad for skiftet, fordi han nu havde mere tid til familien.",
    promptText: "Peter fik jobbet efter en samtale.",
    options: ["Sandt", "Falsk"],
    answer: ["Sandt"],
    explanation: "'Han søgte en stilling ... og han fik jobbet efter en samtale.'",
  },
  {
    tier: 2,
    topic: "ARBEJDE",
    constructs: ["subordinate-clause:fordi"],
    type: "GAP_FILL",
    passageId: "m2-t2-arbejde-peter-jobskift",
    passageText:
      "Sidste år skiftede Peter job, fordi han ville arbejde tættere på sit hjem. Han søgte en stilling på et hospital i sin egen by, og han fik jobbet efter en samtale. I den nye stilling arbejdede han med de samme opgaver som før, men transporttiden blev meget kortere. Peter var glad for skiftet, ___ han nu havde mere tid til familien.",
    promptText: "Udfyld det manglende ord.",
    options: ["fordi", "når", "selvom"],
    answer: ["fordi"],
    explanation: "'Fordi' indleder en ledsætning, der giver en årsag/grund.",
  },

  {
    tier: 2,
    topic: "UDDANNELSE",
    constructs: ["subordinate-clause:at"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t2-uddannelse-maria-modultest",
    passageText:
      "Maria vil gerne bestå modultesten, og hun håber, at hun kan læse bedre dansk om et halvt år. Hendes lærer siger, at Maria skal øve sig hver dag for at blive bedre. Maria tror, at hun kan nå sit mål, hvis hun arbejder hårdt. Hun skal snart til en ny test.",
    promptText: "Hvad håber Maria?",
    options: [
      "At hun kan læse bedre dansk om et halvt år",
      "At hun kan holde ferie snart",
      "At hun kan stoppe med skolen",
      "At hun kan blive lærer",
    ],
    answer: ["At hun kan læse bedre dansk om et halvt år"],
    explanation: "'Hun håber, at hun kan læse bedre dansk om et halvt år.'",
  },
  {
    tier: 2,
    topic: "UDDANNELSE",
    constructs: ["modal-verb"],
    type: "TRUE_FALSE",
    passageId: "m2-t2-uddannelse-maria-modultest",
    passageText:
      "Maria vil gerne bestå modultesten, og hun håber, at hun kan læse bedre dansk om et halvt år. Hendes lærer siger, at Maria skal øve sig hver dag for at blive bedre. Maria tror, at hun kan nå sit mål, hvis hun arbejder hårdt. Hun skal snart til en ny test.",
    promptText: "Læreren siger, at Maria ikke skal øve sig.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "Læreren siger det modsatte: 'Maria skal øve sig hver dag.'",
  },
  {
    tier: 2,
    topic: "UDDANNELSE",
    constructs: ["subordinate-clause:at"],
    type: "GAP_FILL",
    passageId: "m2-t2-uddannelse-maria-modultest",
    passageText:
      "Maria vil gerne bestå modultesten, og hun håber, at hun kan læse bedre dansk om et halvt år. Hendes lærer siger, ___ Maria skal øve sig hver dag for at blive bedre. Maria tror, at hun kan nå sit mål, hvis hun arbejder hårdt. Hun skal snart til en ny test.",
    promptText: "Udfyld det manglende ord.",
    options: ["at", "når", "men"],
    answer: ["at"],
    explanation: "'At' indleder en ledsætning efter udsagnsverber som 'sige' og 'håbe'.",
  },

  {
    tier: 2,
    topic: "HVERDAGSLIV",
    constructs: ["past-tense"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t2-hverdagsliv-familien-flytter",
    passageText:
      "Familien Nielsen boede før i en lille lejlighed. Køkkenet var meget lille, og når de lavede mad sammen, stod de tæt op ad hinanden. De flyttede sidste sommer til en større lejlighed. Nu, når de spiser aftensmad, sidder de alle ved et stort bord. Børnene var glade for de nye værelser.",
    promptText: "Hvornår flyttede familien Nielsen?",
    options: ["Sidste sommer", "Sidste vinter", "For to år siden", "I sidste uge"],
    answer: ["Sidste sommer"],
    explanation: "'De flyttede sidste sommer til en større lejlighed.'",
  },
  {
    tier: 2,
    topic: "HVERDAGSLIV",
    constructs: ["past-tense"],
    type: "TRUE_FALSE",
    passageId: "m2-t2-hverdagsliv-familien-flytter",
    passageText:
      "Familien Nielsen boede før i en lille lejlighed. Køkkenet var meget lille, og når de lavede mad sammen, stod de tæt op ad hinanden. De flyttede sidste sommer til en større lejlighed. Nu, når de spiser aftensmad, sidder de alle ved et stort bord. Børnene var glade for de nye værelser.",
    promptText: "Det gamle køkken var stort.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "'Køkkenet var meget lille.'",
  },
  {
    tier: 2,
    topic: "HVERDAGSLIV",
    constructs: ["subordinate-clause:naar"],
    type: "GAP_FILL",
    passageId: "m2-t2-hverdagsliv-familien-flytter",
    passageText:
      "Familien Nielsen boede før i en lille lejlighed. Køkkenet var meget lille, og når de lavede mad sammen, stod de tæt op ad hinanden. De flyttede sidste sommer til en større lejlighed. Nu, ___ de spiser aftensmad, sidder de alle ved et stort bord. Børnene var glade for de nye værelser.",
    promptText: "Udfyld det manglende ord.",
    options: ["når", "fordi", "men"],
    answer: ["når"],
    explanation: "'Når' bruges om et tidspunkt/en gentagen situation.",
  },

  {
    tier: 2,
    topic: "MEDBORGERSKAB",
    constructs: ["subordinate-clause:fordi"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t2-medborgerskab-skat",
    passageText:
      "Alle borgere i Danmark skal betale skat, fordi skatten betaler for skoler, hospitaler og veje. Man må gerne sige sin mening offentligt, fordi Danmark har ytringsfrihed. Nye borgere skal lære om det danske samfund, og de bør deltage i lokale valg, når de har mulighed for det. Mange mener, at medborgerskab handler om at tage ansvar.",
    promptText: "Hvorfor skal borgere betale skat?",
    options: [
      "Fordi skatten betaler for skoler, hospitaler og veje",
      "Fordi det er en gammel tradition",
      "Fordi andre lande også gør det",
      "Fordi det er gratis",
    ],
    answer: ["Fordi skatten betaler for skoler, hospitaler og veje"],
    explanation: "'Alle borgere skal betale skat, fordi skatten betaler for skoler, hospitaler og veje.'",
  },
  {
    tier: 2,
    topic: "MEDBORGERSKAB",
    constructs: ["modal-verb"],
    type: "TRUE_FALSE",
    passageId: "m2-t2-medborgerskab-skat",
    passageText:
      "Alle borgere i Danmark skal betale skat, fordi skatten betaler for skoler, hospitaler og veje. Man må gerne sige sin mening offentligt, fordi Danmark har ytringsfrihed. Nye borgere skal lære om det danske samfund, og de bør deltage i lokale valg, når de har mulighed for det. Mange mener, at medborgerskab handler om at tage ansvar.",
    promptText: "Man må ikke sige sin mening offentligt i Danmark.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "'Man må gerne sige sin mening offentligt, fordi Danmark har ytringsfrihed.'",
  },
  {
    tier: 2,
    topic: "MEDBORGERSKAB",
    constructs: ["modal-verb"],
    type: "GAP_FILL",
    passageId: "m2-t2-medborgerskab-skat",
    passageText:
      "Alle borgere i Danmark skal betale skat, fordi skatten betaler for skoler, hospitaler og veje. Man må gerne sige sin mening offentligt, fordi Danmark har ytringsfrihed. Nye borgere ___ lære om det danske samfund, og de bør deltage i lokale valg, når de har mulighed for det.",
    promptText: "Udfyld det manglende ord.",
    options: ["skal", "er", "har"],
    answer: ["skal"],
    explanation: "'Skal' er modalverbet, der udtrykker en forpligtelse her.",
  },
  {
    tier: 2,
    topic: "MEDBORGERSKAB",
    constructs: ["subordinate-clause:fordi", "subordinate-clause:naar"],
    type: "MATCHING",
    passageId: "m2-t2-medborgerskab-skat",
    passageText:
      "Alle borgere i Danmark skal betale skat, fordi skatten betaler for skoler, hospitaler og veje. Man må gerne sige sin mening offentligt, fordi Danmark har ytringsfrihed. Nye borgere skal lære om det danske samfund, og de bør deltage i lokale valg, når de har mulighed for det. Mange mener, at medborgerskab handler om at tage ansvar.",
    promptText: "Match konnektoren med dens funktion.",
    options: { left: ["fordi", "når"], right: ["Angiver et tidspunkt/en betingelse", "Angiver en årsag/grund"] },
    answer: ["0:1", "1:0"],
    explanation: "'Fordi' angiver årsag; 'når' angiver tidspunkt eller betingelse.",
  },

  // ---------------------------------------------------------------------
  // TIER 3 — passive voice, wider connectors, multiple subordinate clauses
  // ---------------------------------------------------------------------
  {
    tier: 3,
    topic: "ARBEJDE",
    constructs: ["passive-voice"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t3-arbejde-hospital-passiv",
    passageText:
      "På hospitalet bliver patienterne undersøgt af en læge, før de bliver indlagt. Reglerne for hygiejne overholdes strengt af alt personale, fordi risikoen for infektioner ellers stiger. Der er for få sygeplejersker i øjeblikket, og derfor bliver mange vagter dækket af vikarer. Ledelsen har derfor besluttet at ansætte flere fastansatte i det næste år.",
    promptText: "Hvad sker der, før patienterne bliver indlagt?",
    options: ["De bliver undersøgt af en læge", "De får mad", "De ringer til familien", "De betaler et gebyr"],
    answer: ["De bliver undersøgt af en læge"],
    explanation: "'Patienterne bliver undersøgt af en læge, før de bliver indlagt.'",
  },
  {
    tier: 3,
    topic: "ARBEJDE",
    constructs: ["connector:derfor"],
    type: "TRUE_FALSE",
    passageId: "m2-t3-arbejde-hospital-passiv",
    passageText:
      "På hospitalet bliver patienterne undersøgt af en læge, før de bliver indlagt. Reglerne for hygiejne overholdes strengt af alt personale, fordi risikoen for infektioner ellers stiger. Der er for få sygeplejersker i øjeblikket, og derfor bliver mange vagter dækket af vikarer. Ledelsen har derfor besluttet at ansætte flere fastansatte i det næste år.",
    promptText: "Der er nok sygeplejersker på hospitalet i øjeblikket.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "'Der er for få sygeplejersker i øjeblikket.'",
  },
  {
    tier: 3,
    topic: "ARBEJDE",
    constructs: ["connector:derfor"],
    type: "GAP_FILL",
    passageId: "m2-t3-arbejde-hospital-passiv",
    passageText:
      "På hospitalet bliver patienterne undersøgt af en læge, før de bliver indlagt. Reglerne for hygiejne overholdes strengt af alt personale, fordi risikoen for infektioner ellers stiger. Der er for få sygeplejersker i øjeblikket, og ___ bliver mange vagter dækket af vikarer. Ledelsen har derfor besluttet at ansætte flere fastansatte i det næste år.",
    promptText: "Udfyld det manglende ord.",
    options: ["derfor", "selvom", "dog"],
    answer: ["derfor"],
    explanation: "'Derfor' viser en konsekvens af mangel på personale.",
  },
  {
    tier: 3,
    topic: "ARBEJDE",
    constructs: ["connector:derfor", "subordinate-clause:fordi"],
    type: "MATCHING",
    passageId: "m2-t3-arbejde-hospital-passiv",
    passageText:
      "På hospitalet bliver patienterne undersøgt af en læge, før de bliver indlagt. Reglerne for hygiejne overholdes strengt af alt personale, fordi risikoen for infektioner ellers stiger. Der er for få sygeplejersker i øjeblikket, og derfor bliver mange vagter dækket af vikarer. Ledelsen har derfor besluttet at ansætte flere fastansatte i det næste år.",
    promptText: "Match konnektoren med dens funktion.",
    options: { left: ["derfor", "fordi"], right: ["Viser en årsag/grund", "Viser en konsekvens (så/derfor)"] },
    answer: ["0:1", "1:0"],
    explanation: "'Fordi' introducerer en grund; 'derfor' introducerer en følge af noget, der allerede er sagt.",
  },

  {
    tier: 3,
    topic: "UDDANNELSE",
    constructs: ["multiple-subordinate-clauses"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t3-uddannelse-maria-grammatik",
    passageText:
      "Selvom Maria synes, at grammatik er svær, øver hun sig hver dag, fordi hun ved, at det hjælper hende til at blive bedre. Hendes lærer forklarer, at man lærer mest, når man både lytter og taler. Selvom nogle elever er nervøse for at tale foran klassen, siger læreren, at det er den bedste måde at lære på.",
    promptText: "Hvorfor øver Maria sig hver dag, selvom grammatik er svær?",
    options: [
      "Fordi hun ved, at det hjælper hende til at blive bedre",
      "Fordi læreren tvinger hende",
      "Fordi det er sjovt",
      "Fordi hun keder sig",
    ],
    answer: ["Fordi hun ved, at det hjælper hende til at blive bedre"],
    explanation: "'Hun øver sig hver dag, fordi hun ved, at det hjælper hende til at blive bedre.'",
  },
  {
    tier: 3,
    topic: "UDDANNELSE",
    constructs: ["multiple-subordinate-clauses"],
    type: "TRUE_FALSE",
    passageId: "m2-t3-uddannelse-maria-grammatik",
    passageText:
      "Selvom Maria synes, at grammatik er svær, øver hun sig hver dag, fordi hun ved, at det hjælper hende til at blive bedre. Hendes lærer forklarer, at man lærer mest, når man både lytter og taler. Selvom nogle elever er nervøse for at tale foran klassen, siger læreren, at det er den bedste måde at lære på.",
    promptText: "Ifølge læreren lærer man mest, når man kun lytter.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "Man lærer mest, 'når man både lytter og taler', ikke kun lytter.",
  },
  {
    tier: 3,
    topic: "UDDANNELSE",
    constructs: ["connector:selvom"],
    type: "GAP_FILL",
    passageId: "m2-t3-uddannelse-maria-grammatik",
    passageText:
      "Selvom Maria synes, at grammatik er svær, øver hun sig hver dag, fordi hun ved, at det hjælper hende til at blive bedre. Hendes lærer forklarer, at man lærer mest, når man både lytter og taler. ___ nogle elever er nervøse for at tale foran klassen, siger læreren, at det er den bedste måde at lære på.",
    promptText: "Udfyld det manglende ord.",
    options: ["Selvom", "Derfor", "Fordi"],
    answer: ["Selvom"],
    explanation: "'Selvom' bruges, når to dele af sætningen står i modsætning til hinanden (nervøs, men gør det alligevel).",
  },

  {
    tier: 3,
    topic: "HVERDAGSLIV",
    constructs: ["passive-voice"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t3-hverdagsliv-lejlighed-flytning",
    passageText:
      "Den nye lejlighed bliver malet af et malerfirma, før familien flytter ind. Møblerne bliver kørt derhen af et flyttefirma i næste uge. Det hele bliver dyrere, end familien havde regnet med. De er dog glade for den nye lejlighed, fordi den ligger tæt på børnenes skole.",
    promptText: "Hvem maler den nye lejlighed?",
    options: ["Et malerfirma", "Familien selv", "Naboerne", "Udlejeren"],
    answer: ["Et malerfirma"],
    explanation: "'Den nye lejlighed bliver malet af et malerfirma.'",
  },
  {
    tier: 3,
    topic: "HVERDAGSLIV",
    constructs: ["connector:dog"],
    type: "TRUE_FALSE",
    passageId: "m2-t3-hverdagsliv-lejlighed-flytning",
    passageText:
      "Den nye lejlighed bliver malet af et malerfirma, før familien flytter ind. Møblerne bliver kørt derhen af et flyttefirma i næste uge. Det hele bliver dyrere, end familien havde regnet med. De er dog glade for den nye lejlighed, fordi den ligger tæt på børnenes skole.",
    promptText: "Flytningen bliver billigere, end familien havde regnet med.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "'Det hele bliver dyrere, end familien havde regnet med.'",
  },
  {
    tier: 3,
    topic: "HVERDAGSLIV",
    constructs: ["connector:dog"],
    type: "GAP_FILL",
    passageId: "m2-t3-hverdagsliv-lejlighed-flytning",
    passageText:
      "Den nye lejlighed bliver malet af et malerfirma, før familien flytter ind. Møblerne bliver kørt derhen af et flyttefirma i næste uge. Det hele bliver dyrere, end familien havde regnet med. De er ___ glade for den nye lejlighed, fordi den ligger tæt på børnenes skole.",
    promptText: "Udfyld det manglende ord.",
    options: ["dog", "derfor", "selvom"],
    answer: ["dog"],
    explanation: "'Dog' viser en kontrast til den dyre pris, der lige er nævnt.",
  },

  {
    tier: 3,
    topic: "MEDBORGERSKAB",
    constructs: ["multiple-subordinate-clauses"],
    type: "MULTIPLE_CHOICE",
    passageId: "m2-t3-medborgerskab-nye-borgere",
    passageText:
      "Selvom mange nye borgere synes, at det danske system er svært at forstå i starten, bliver de fleste bedre til det, når de har boet i landet i nogle år. Kommunen tilbyder kurser, hvor man kan lære om rettigheder og pligter, fordi det er vigtigt, at alle forstår, hvordan samfundet fungerer. Selvom kurserne er frivillige, deltager mange, fordi de gerne vil forstå deres nye hjemland bedre.",
    promptText: "Hvad tilbyder kommunen?",
    options: [
      "Kurser om rettigheder og pligter",
      "Gratis transport",
      "Sprogskole om aftenen",
      "Hjælp til at finde job",
    ],
    answer: ["Kurser om rettigheder og pligter"],
    explanation: "'Kommunen tilbyder kurser, hvor man kan lære om rettigheder og pligter.'",
  },
  {
    tier: 3,
    topic: "MEDBORGERSKAB",
    constructs: ["connector:selvom"],
    type: "TRUE_FALSE",
    passageId: "m2-t3-medborgerskab-nye-borgere",
    passageText:
      "Selvom mange nye borgere synes, at det danske system er svært at forstå i starten, bliver de fleste bedre til det, når de har boet i landet i nogle år. Kommunen tilbyder kurser, hvor man kan lære om rettigheder og pligter, fordi det er vigtigt, at alle forstår, hvordan samfundet fungerer. Selvom kurserne er frivillige, deltager mange, fordi de gerne vil forstå deres nye hjemland bedre.",
    promptText: "Kurserne er obligatoriske.",
    options: ["Sandt", "Falsk"],
    answer: ["Falsk"],
    explanation: "'Kurserne er frivillige', ikke obligatoriske.",
  },
  {
    tier: 3,
    topic: "MEDBORGERSKAB",
    constructs: ["connector:selvom"],
    type: "GAP_FILL",
    passageId: "m2-t3-medborgerskab-nye-borgere",
    passageText:
      "Selvom mange nye borgere synes, at det danske system er svært at forstå i starten, bliver de fleste bedre til det, når de har boet i landet i nogle år. Kommunen tilbyder kurser, hvor man kan lære om rettigheder og pligter, fordi det er vigtigt, at alle forstår, hvordan samfundet fungerer. ___ kurserne er frivillige, deltager mange, fordi de gerne vil forstå deres nye hjemland bedre.",
    promptText: "Udfyld det manglende ord.",
    options: ["Selvom", "Derfor", "Når"],
    answer: ["Selvom"],
    explanation: "Kontrast mellem 'frivillig' og alligevel høj deltagelse kræver 'selvom'.",
  },
];
