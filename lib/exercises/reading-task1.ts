import type { ExerciseVariant } from "./types";

// Læsning, Opgave 1 — match each person to the advert that suits them.
//
// Mechanics copied from the real modultest, length shortened: 4 people and 6
// selectable adverts (plus one worked example), of which 2 adverts are never
// the answer. In the full test it is 6 people and 8 adverts with 2 unused.
//
// Authoring rules that keep these solvable and fair:
//  - Exactly one advert satisfies ALL of a person's stated constraints.
//    Every person states at least two (e.g. location AND price, or type AND
//    who it is for), so no answer can be reached on a single keyword.
//  - The distractors are plausible housing/jobs/courses that fail on one
//    concrete, checkable point — a price ceiling, a city, a season, a
//    requirement — never on being absurd.
//  - Difficulty comes from comparing details, not from rare vocabulary.

const INSTRUCTION = [
  "Læs de små tekster om personerne (1-4).",
  "Find den annonce (B-G), der passer til hver tekst.",
  "Der er to annoncer, du ikke skal bruge.",
  "Se eksemplet (0).",
];

export const READING_TASK1_VARIANTS: ExerciseVariant[] = [
  // ---------------------------------------------------------------------
  {
    variantId: "r1-bolig",
    category: "READING",
    taskType: "reading_task_1_matching",
    moduleId: 2,
    topic: "Bolig",
    title: "Fire personer søger en ny bolig",
    instruction: INSTRUCTION,
    difficulty: "medium",
    content: {
      kind: "reading_task_1_matching",
      example: {
        personText:
          "Sofie er 22 år og skal begynde at læse på universitetet i København til september. Hun har ikke mange penge og vil gerne bo sammen med andre unge.",
        adId: "A",
      },
      people: [
        {
          id: "1",
          text: "Familien Berg har to børn på 5 og 9 år. De bor i en lejlighed uden altan, og børnene mangler et sted at lege. De søger et hus med have og kan betale op til 16.000 kr. om måneden.",
        },
        {
          id: "2",
          text: "Mikkel er tømrer. Han drømmer om at købe et gammelt hus på landet, som han selv kan sætte i stand i sin fritid. Prisen må ikke være over 1 million kroner.",
        },
        {
          id: "3",
          text: "Layla læser til sygeplejerske i Aarhus og skal snart i praktik på hospitalet. Hun søger en lille lejlighed helt tæt på hospitalet og må højst betale 5.000 kr. om måneden.",
        },
        {
          id: "4",
          text: "Ove og Bente er blevet pensionister. De vil sælge deres store hus og flytte i en mindre lejlighed med altan. Det er vigtigt, at der er elevator, og at der er butikker i nærheden.",
        },
      ],
      ads: [
        {
          id: "A",
          title: "Nørrebro Kollegium – værelser til studerende",
          body: "Vi har 60 værelser på 16-20 m² midt i København. Kollegiet er kun for studerende ved Københavns Universitet. Man deler køkken og badeværelse med syv andre. Der er fællesrum, vaskekælder og cykelparkering. Husleje: 2.900 kr. pr. måned inkl. varme og internet. Skriv til os på kollegiet.dk",
        },
        {
          id: "B",
          title: "Rækkehus i Roskilde – 4 værelser, 118 m²",
          body: "Dejligt rækkehus med tre soveværelser, stort køkken-alrum og egen have på 210 m². Haven har græsplæne og en lille terrasse. Skole og børnehave ligger 500 meter væk. Husleje: 15.400 kr. om måneden. Depositum: 46.200 kr. Ledig fra 1. august. Se boligen på boligsiden.dk",
        },
        {
          id: "C",
          title: "Landejendom sælges – trænger til istandsættelse",
          body: "Gammelt stuehus fra 1912 på 140 m² med 3.000 m² jord, 12 km fra Ringkøbing. Huset har nyt tag, men køkken og bad skal laves helt om, og der skal lægges nye gulve. Perfekt for en håndværker. Pris: 845.000 kr. Kontakt Vestjysk Bolig på 97 12 44 20",
        },
        {
          id: "D",
          title: "1-værelses lejlighed, 34 m², Aarhus N",
          body: "Lille, lys lejlighed på 2. sal med eget bad og tekøkken. Der er 300 meter til Aarhus Universitetshospital og busstoppested lige uden for døren. Husleje: 4.700 kr. om måneden inkl. vand. Depositum: 9.400 kr. Udlejes helst til en studerende. Skriv på aarhusbolig.dk",
        },
        {
          id: "E",
          title: "2-værelses lejlighed med altan – Vejle midtby",
          body: "Velholdt lejlighed på 68 m² på 3. sal. Der er elevator i opgangen. Stor sydvendt altan. Supermarked, apotek og bibliotek ligger på samme gade. Ejendommen er især populær blandt ældre beboere. Husleje: 7.850 kr. om måneden. Depositum: 23.550 kr.",
        },
        {
          id: "F",
          title: "Stor villa til salg – Hellerup, 240 m²",
          body: "Nyrenoveret villa i seks værelser med nyt designerkøkken, to badeværelser og anlagt have med bålsted. Alt er lavet færdigt af håndværkere i 2024, så man kan flytte direkte ind. Pris: 9.400.000 kr. Kontakt mægleren for en fremvisning.",
        },
        {
          id: "G",
          title: "Sommerhus udlejes ved Vesterhavet",
          body: "Hyggeligt sommerhus på 75 m² med plads til seks personer, 400 meter fra stranden. Der er brændeovn, terrasse og udsigt over klitterne. Huset lejes ud pr. uge i perioden 1. maj – 15. september. Pris: 4.900 kr. pr. uge. Book på feriehusudlejning.dk",
        },
      ],
      answers: { "1": "B", "2": "C", "3": "D", "4": "E" },
      rationales: {
        "1": "Familien vil have et hus med have til maks. 16.000 kr. B er et rækkehus med egen have til 15.400 kr. F har også have, men er til salg og koster 9,4 mio. kr.",
        "2": "Mikkel vil købe på landet under 1 mio. kr. og selv sætte i stand. C koster 845.000 kr., ligger på landet, og køkken og bad skal laves om. F er netop færdigrenoveret, så der er intet at lave.",
        "3": "Layla skal bo helt tæt på hospitalet i Aarhus for maks. 5.000 kr. D ligger 300 meter fra Aarhus Universitetshospital og koster 4.700 kr. A er billigere, men ligger i København og kun for KU-studerende.",
        "4": "Ove og Bente vil have altan, elevator og butikker tæt på. E har alle tre dele. B og F er huse, ikke lejligheder.",
      },
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r1-arbejde",
    category: "READING",
    taskType: "reading_task_1_matching",
    moduleId: 2,
    topic: "Arbejde",
    title: "Fire personer søger et job",
    instruction: [
      "Læs de små tekster om personerne (1-4).",
      "Find den jobannonce (B-G), der passer til hver tekst.",
      "Der er to annoncer, du ikke skal bruge.",
      "Se eksemplet (0).",
    ],
    difficulty: "medium",
    content: {
      kind: "reading_task_1_matching",
      example: {
        personText:
          "Amir er lige blevet færdig med sin uddannelse som kok. Han vil gerne arbejde om aftenen på en restaurant i en større by.",
        adId: "A",
      },
      people: [
        {
          id: "1",
          text: "Nadia har kørekort til lastbil og har kørt varer ud i seks år. Hun vil gerne have et job, hvor hun kommer hjem hver dag, for hun har to små børn.",
        },
        {
          id: "2",
          text: "Tobias går i 2. g og vil gerne tjene lidt penge ved siden af skolen. Han kan kun arbejde i weekenden, og han har ingen erfaring.",
        },
        {
          id: "3",
          text: "Rikke er uddannet pædagog og har arbejdet ti år i børnehave. Nu vil hun hellere arbejde med ældre mennesker. Hun søger fuldtid i Odense.",
        },
        {
          id: "4",
          text: "Jonas er ingeniør og taler flydende engelsk. Han leder efter et job, hvor han kan arbejde hjemmefra det meste af tiden, fordi hans kone arbejder i udlandet.",
        },
      ],
      ads: [
        {
          id: "A",
          title: "Restaurant Havnen søger kok",
          body: "Vi søger en kok til vores køkken i Aalborg. Arbejdstiden er fra kl. 15 til kl. 23, fem dage om ugen. Du skal være uddannet kok, men du behøver ikke have lang erfaring. Vi er et ungt team på ni personer. Løn efter overenskomst. Send din ansøgning til job@restauranthavnen.dk",
        },
        {
          id: "B",
          title: "Chauffør søges til lokal kørsel",
          body: "Vi kører dagligvarer ud til butikker i Nordsjælland og søger en chauffør med kørekort til lastbil og minimum tre års erfaring. Du kører ud om morgenen og er altid tilbage på lageret senest kl. 16. Ingen overnatning. 37 timer om ugen. Ring til Peter på 40 55 21 08",
        },
        {
          id: "C",
          title: "Fritidsjob i Superbutikken",
          body: "Vi mangler unge til at fylde varer op og hjælpe kunderne. Du skal arbejde lørdag og søndag, i alt 8 timer om ugen. Du skal være mindst 16 år. Du behøver ikke have prøvet at arbejde i en butik før – vi lærer dig det hele. Kom forbi butikken med din ansøgning.",
        },
        {
          id: "D",
          title: "Plejehjemmet Solsikken søger medarbejder",
          body: "Vi søger en kollega til vores plejehjem i Odense, hvor vi har 42 beboere. Du skal hjælpe de ældre i hverdagen og være med til at arrangere aktiviteter. Vi ser gerne, at du er uddannet pædagog eller social- og sundhedsassistent. Fuldtid, 37 timer. Start 1. oktober.",
        },
        {
          id: "E",
          title: "Softwareingeniør – arbejd hjemmefra",
          body: "Vi er en lille virksomhed med kunder i hele Europa, og vores medarbejdere arbejder hjemmefra fire dage om ugen. Én dag om måneden mødes vi på kontoret i Vejle. Du skal være uddannet ingeniør og kunne tale og skrive engelsk uden problemer. Skriv til hr@nordictech.dk",
        },
        {
          id: "F",
          title: "Lastbilchauffør til international kørsel",
          body: "Kør for os i Tyskland, Holland og Belgien. Du kører ud mandag og kommer hjem fredag eller lørdag. Vi betaler alle udgifter på turen. Du skal have kørekort til lastbil og tale lidt tysk. God løn og faste ture. Kontakt Europa Transport A/S.",
        },
        {
          id: "G",
          title: "Pædagog søges til vuggestue",
          body: "Vores vuggestue i Aarhus søger en pædagog til en gruppe med 12 børn mellem 0 og 3 år. Du skal have en pædagoguddannelse og gerne erfaring med de mindste børn. 32 timer om ugen. Vi har en dejlig legeplads og en fast madordning.",
        },
      ],
      answers: { "1": "B", "2": "C", "3": "D", "4": "E" },
      rationales: {
        "1": "Nadia vil hjem hver dag. B er lokal kørsel uden overnatning, tilbage senest kl. 16. F er også lastbil, men man er væk hele ugen.",
        "2": "Tobias kan kun arbejde i weekenden og har ingen erfaring. C er lørdag og søndag, og man behøver ikke have arbejdet før.",
        "3": "Rikke er pædagog, vil arbejde med ældre og søger fuldtid i Odense. D er et plejehjem i Odense på 37 timer. G er også for pædagoger, men det er små børn i Aarhus.",
        "4": "Jonas vil arbejde hjemmefra og taler engelsk. E er hjemmearbejde fire dage om ugen og kræver engelsk og en ingeniøruddannelse.",
      },
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r1-fritid",
    category: "READING",
    taskType: "reading_task_1_matching",
    moduleId: 2,
    topic: "Fritid og kurser",
    title: "Fire personer søger en fritidsaktivitet",
    instruction: [
      "Læs de små tekster om personerne (1-4).",
      "Find den annonce (B-G), der passer til hver tekst.",
      "Der er to annoncer, du ikke skal bruge.",
      "Se eksemplet (0).",
    ],
    difficulty: "medium",
    content: {
      kind: "reading_task_1_matching",
      example: {
        personText:
          "Pia vil gerne begynde at synge sammen med andre. Hun har aldrig sunget i kor før og vil helst mødes én gang om ugen om aftenen.",
        adId: "A",
      },
      people: [
        {
          id: "1",
          text: "Hassan er 45 år og sidder ned hele dagen på sit kontor. Lægen har sagt, at han skal bevæge sig mere. Han vil gerne træne udendørs i en gruppe, og han er slet ikke i form.",
        },
        {
          id: "2",
          text: "Yuki er flyttet til Danmark for et år siden. Hun taler dansk i skolen, men hun kender ingen danskere og vil gerne øve sig i at tale i en afslappet situation.",
        },
        {
          id: "3",
          text: "Bo og hans datter på 9 år vil gerne lave noget sammen om lørdagen. Bo er god til at bruge værktøj, og datteren elsker at bygge ting.",
        },
        {
          id: "4",
          text: "Grete er 71 år og har dårlige knæ. Hun vil gerne træne i vand, hvor det ikke gør ondt, og helst sammen med andre på hendes alder.",
        },
      ],
      ads: [
        {
          id: "A",
          title: "Syng med i Byens Kor",
          body: "Vi er 35 sangere, der mødes hver torsdag kl. 19-21 i Kulturhuset. Du behøver ikke kunne læse noder, og du skal ikke synge alene til en prøve – alle er velkomne. Vi synger både danske sange og musik fra hele verden. Pris: 400 kr. for en hel sæson.",
        },
        {
          id: "B",
          title: "Løb for begyndere – ude i parken",
          body: "Har du aldrig løbet før? Vores hold starter helt fra bunden med gåture og korte løbeture på fem minutter. Vi træner udenfor i Fælledparken hver tirsdag og torsdag kl. 17.30, også om vinteren. Træneren tilpasser tempoet, så alle kan være med. 250 kr. for 10 gange.",
        },
        {
          id: "C",
          title: "Sprogcafé på biblioteket",
          body: "Kom og snak dansk over en kop kaffe hver onsdag kl. 16-18. Her sidder danskere og folk fra hele verden og taler sammen om helt almindelige ting. Det er ikke undervisning, og der er ingen lektier eller prøver. Det er gratis, og du skal ikke melde dig til.",
        },
        {
          id: "D",
          title: "Familieværksted – byg sammen med dit barn",
          body: "Hver lørdag kl. 10-13 åbner vores værksted for voksne og børn mellem 7 og 12 år. I bygger sammen i træ: fuglehuse, kasser og små møbler. Der er værktøj og hjælp fra en snedker. Man deltager altid to og to – en voksen og et barn. 150 kr. pr. gang.",
        },
        {
          id: "E",
          title: "Vandgymnastik for seniorer",
          body: "Blid træning i varmt vand for dig over 65 år. Vandet bærer kroppen, så det er skånsomt for knæ, hofter og ryg. Vi træner mandag og onsdag kl. 10-11 i svømmehallen. Du skal ikke kunne svømme godt – vi bliver på lavt vand. 600 kr. for et halvt år.",
        },
        {
          id: "F",
          title: "Maratonklubben søger nye løbere",
          body: "Vi træner til maraton og løber mellem 60 og 90 km om ugen. Du skal kunne løbe 10 km på under 50 minutter for at være med på holdet. Vi mødes fire gange om ugen, og vi tager til løb i udlandet to gange om året. Kontakt træneren for en prøvetræning.",
        },
        {
          id: "G",
          title: "Svømmehold for børn",
          body: "Lær dit barn at svømme! Holdene er for børn mellem 5 og 10 år, og der er en instruktør i vandet hele tiden. Vi træner tirsdag kl. 16 og fredag kl. 15.30. Forældre venter på tilskuerpladserne. 450 kr. for en sæson.",
        },
      ],
      answers: { "1": "B", "2": "C", "3": "D", "4": "E" },
      rationales: {
        "1": "Hassan er ikke i form og vil træne udendørs i en gruppe. B starter helt fra bunden og træner ude. F er også løb, men kræver 10 km på under 50 minutter.",
        "2": "Yuki vil øve dansk afslappet. C er en sprogcafé uden undervisning, lektier og prøver.",
        "3": "Bo og datteren på 9 år vil lave noget sammen om lørdagen med værktøj. D er lørdag, for børn på 7-12 år, og man deltager netop en voksen og et barn sammen.",
        "4": "Grete er 71 og har dårlige knæ. E er vandgymnastik for folk over 65 og er skånsomt for knæene. G er også i vand, men for børn på 5-10 år.",
      },
    },
  },
];
