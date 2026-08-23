import type { ExerciseVariant } from "@/types";

// Læsning, Opgave 4 — decide which of three people each question is about.
//
// The trap the real modultest sets, and which is reproduced here: the answer
// is never the person who repeats the question's wording. "Hvem er
// studerende?" is answered by the person who wrote "jeg læser til pædagog",
// not by anyone using the word 'studerende'. The three texts also overlap
// heavily — all three mention children, or money, or evenings — so scanning
// for a keyword lands on the wrong person.
//
// Shortened to 5 questions plus a worked example (the full test uses 7).

const INSTRUCTION = [
  "Læs de tre tekster, og læs spørgsmålene (1-5).",
  "Find den person, der passer til hvert af de fem spørgsmål.",
  "Sæt kryds ud for den person, der passer til spørgsmålet.",
  "Se eksemplet (0).",
];

export const READING_TASK4_VARIANTS: ExerciseVariant[] = [
  // ---------------------------------------------------------------------
  {
    variantId: "r4-arbejde",
    category: "READING",
    taskType: "reading_task_4_people_matching",
    moduleId: 2,
    topic: "Arbejde",
    title: "Tre personer fortæller om deres arbejde",
    instruction: INSTRUCTION,
    difficulty: "medium",
    content: {
      kind: "reading_task_4_people_matching",
      heading: "Tre personer fortæller om deres arbejde",
      people: [
        {
          id: "A",
          name: "Nadia",
          text: "Jeg er bager og møder på arbejde klokken tre om natten. Det lyder hårdt, og de første måneder var jeg også helt færdig, når jeg kom hjem. Nu har jeg vænnet mig til det. Jeg begyndte i bageriet for et halvt år siden, så jeg er stadig den nye. Vi er kun tre i køkkenet, og vi taler ikke så meget, mens vi arbejder. Jeg står op hele vagten, og armene bliver trætte af at ælte dej. Det bedste er, at jeg har fri klokken tolv. Så kan jeg sove lidt og alligevel nå at hente mine to piger, inden de bliver trætte og sultne.",
        },
        {
          id: "B",
          name: "Elias",
          text: "Jeg kører bus i Aarhus og har gjort det i tolv år. Jeg kører forskellige vagter, også lørdag og søndag, og det er svært at planlægge noget med familien. Mine egne børn er heldigvis store nu og klarer sig selv. Jeg møder mange mennesker hver dag, og jeg kender efterhånden dem, der står på ved de samme stoppesteder. Vi hilser og siger et par ord. Nogle passagerer er sure, hvis bussen er forsinket, men det tager jeg ikke personligt. Det eneste, jeg ikke kan lide, er, at jeg sidder ned i otte timer. Min ryg gør ondt om aftenen.",
        },
        {
          id: "C",
          name: "Farida",
          text: "Jeg arbejder som vikar i børnehaver. Det betyder, at jeg næsten hver uge er et nyt sted i kommunen. Nogle gange ringer de først om morgenen, og så skal jeg hurtigt af sted. Det svære er, at jeg ikke kender børnene, og de kender ikke mig. Der går altid et par timer, før de tør komme hen til mig. Om aftenen læser jeg til pædagog på deltid, og jeg har to år tilbage. Så kan jeg forhåbentlig få en fast stilling ét sted. Lige nu tjener jeg ikke ret meget, men jeg lærer utrolig meget af at se så mange forskellige huse.",
        },
      ],
      example: { question: "Hvem arbejder om natten?", personId: "A" },
      questions: [
        {
          id: "1",
          question: "Hvem har haft det samme arbejde i mange år?",
          personId: "B",
          why: "Elias skriver, at han har kørt bus i tolv år. Nadia begyndte for et halvt år siden, og Farida er vikar et nyt sted næsten hver uge.",
        },
        {
          id: "2",
          question: "Hvem er i gang med en uddannelse?",
          personId: "C",
          why: "Farida skriver 'om aftenen læser jeg til pædagog på deltid'. Hun bruger ikke ordet uddannelse, men det er det, sætningen betyder.",
        },
        {
          id: "3",
          question: "Hvem sidder ned det meste af arbejdsdagen?",
          personId: "B",
          why: "Elias sidder ned i otte timer og får ondt i ryggen. Nadia står op hele vagten, og Farida er sammen med børn i en børnehave.",
        },
        {
          id: "4",
          question: "Hvem har fri, før eftermiddagen begynder?",
          personId: "A",
          why: "Nadia har fri klokken tolv. Elias kører otte timers vagter på skiftende tidspunkter, og Farida er i børnehaven om dagen.",
        },
        {
          id: "5",
          question: "Hvem tjener lige nu ikke særlig meget?",
          personId: "C",
          why: "Farida skriver direkte, at hun ikke tjener ret meget lige nu, men at hun lærer meget.",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r4-fritid",
    category: "READING",
    taskType: "reading_task_4_people_matching",
    moduleId: 2,
    topic: "Fritid",
    title: "Tre personer fortæller om deres fritid",
    instruction: INSTRUCTION,
    difficulty: "medium",
    content: {
      kind: "reading_task_4_people_matching",
      heading: "Tre personer fortæller om deres fritid",
      people: [
        {
          id: "A",
          name: "Simon",
          text: "Jeg spiller badminton to gange om ugen i en klub tæt på mit hjem. Jeg har spillet, siden jeg var ni år, så det er efterhånden mange år. Vi er otte på holdet, og vi er blevet rigtig gode venner. Efter træningen sidder vi tit i cafeteriet og snakker en time. Om sommeren holder klubben pause i tre måneder, og så savner jeg det virkelig. Sidste år prøvede jeg at løbe i stedet, men det blev hurtigt kedeligt, fordi jeg var alene. Det er ikke selve sporten, der betyder mest for mig. Det er de mennesker, jeg møder der.",
        },
        {
          id: "B",
          name: "Louise",
          text: "Jeg har en lille kolonihave uden for byen. Jeg overtog den for tre år siden, og den var dengang helt vokset til. Nu har jeg jordbær, kartofler og æbler, og i august giver jeg grøntsager væk til naboerne, fordi der er alt for meget til mig selv. Jeg tager derud alene efter arbejde og bliver til det bliver mørkt. Jeg hører ikke musik og taler ikke i telefon, mens jeg er der. Det er de eneste timer i ugen, hvor jeg ikke tænker på mit arbejde. Om vinteren er der ikke så meget at lave, og det synes jeg faktisk er svært.",
        },
        {
          id: "C",
          name: "Amina",
          text: "Jeg begyndte at male for halvandet år siden. Jeg havde aldrig prøvet det før, og jeg troede ikke, jeg kunne finde ud af det. Jeg går på et hold på aftenskolen hver mandag sammen med tolv andre. Læreren siger, at man ikke skal tænke så meget, men bare gå i gang. Jeg maler også derhjemme i weekenden, når mine børn sover til middag. Min familie synes, det er mærkeligt, at jeg bruger penge på det, for jeg sælger jo ikke noget. Men jeg er ligeglad. Jeg har brug for at lave noget, der kun er mit.",
        },
      ],
      example: { question: "Hvem dyrker sport?", personId: "A" },
      questions: [
        {
          id: "1",
          question: "Hvem er begyndt på sin aktivitet for ikke så lang tid siden?",
          personId: "C",
          why: "Amina begyndte at male for halvandet år siden. Simon har spillet badminton siden han var ni, og Louise har haft haven i tre år.",
        },
        {
          id: "2",
          question: "Hvem laver noget helt alene?",
          personId: "B",
          why: "Louise tager ud i haven alene og taler ikke engang i telefon. Simon er på et hold på otte, og Amina går på et hold med tolv andre.",
        },
        {
          id: "3",
          question: "Hvem synes, at de andre mennesker er det vigtigste?",
          personId: "A",
          why: "Simon skriver, at det ikke er sporten, men menneskene, der betyder mest for ham.",
        },
        {
          id: "4",
          question: "Hvem giver noget væk til andre?",
          personId: "B",
          why: "Louise giver grøntsager til naboerne i august, fordi hun har for meget. Amina sælger og giver ikke noget væk.",
        },
        {
          id: "5",
          question: "Hvem har familie, der ikke helt forstår aktiviteten?",
          personId: "C",
          why: "Aminas familie synes, det er mærkeligt, at hun bruger penge på at male, når hun ikke sælger noget.",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r4-danmark",
    category: "READING",
    taskType: "reading_task_4_people_matching",
    moduleId: 2,
    topic: "At bo i Danmark",
    title: "Tre personer fortæller om at flytte til Danmark",
    instruction: INSTRUCTION,
    difficulty: "medium",
    content: {
      kind: "reading_task_4_people_matching",
      heading: "Tre personer fortæller om at flytte til Danmark",
      people: [
        {
          id: "A",
          name: "Tomasz",
          text: "Jeg kom til Danmark for otte år siden for at arbejde på en fabrik i Jylland. Jeg troede, jeg skulle blive et år og så rejse hjem igen. Men jeg mødte min kone her, og nu har vi et hus og en datter på fire. Jeg lærte først dansk rigtigt, da min datter begyndte i børnehave, for de andre forældre talte kun dansk til møderne. Før det klarede jeg mig på engelsk på arbejdet. Jeg savner stadig min mor og mine søskende, og vi taler sammen på video hver søndag. Men jeg vil ikke flytte tilbage nu.",
        },
        {
          id: "B",
          name: "Grace",
          text: "Jeg flyttede hertil sidste efterår, fordi min mand fik arbejde i København. Det har været sværere, end jeg regnede med. Jeg var sygeplejerske derhjemme, men jeg må ikke arbejde som sygeplejerske her, før jeg består en danskprøve og får papirerne godkendt. Så lige nu går jeg i sprogskole hver dag og læser om aftenen. Det er mærkeligt at gå fra at være en, alle spurgte til råds, til at være en, der ikke kan sige en hel sætning. Naboerne er venlige nok, men de inviterer ikke rigtig indenfor. Jeg håber, det ændrer sig.",
        },
        {
          id: "C",
          name: "Hoang",
          text: "Jeg er født i Vietnam, men jeg kom hertil som barn sammen med mine forældre. Jeg gik i dansk skole fra 3. klasse, så jeg taler dansk uden at tænke over det. Mine forældre taler stadig ikke ret meget dansk, og jeg har oversat for dem, siden jeg var ti år. Jeg tager stadig med til lægen og på kommunen sammen med min mor. Nogle gange er det trættende, men sådan er det. I dag arbejder jeg i en butik og læser til datamatiker ved siden af. Jeg har aldrig været i Vietnam som voksen.",
        },
      ],
      example: { question: "Hvem kom til Danmark for at arbejde?", personId: "A" },
      questions: [
        {
          id: "1",
          question: "Hvem er kommet til landet for ganske nylig?",
          personId: "B",
          why: "Grace flyttede hertil sidste efterår. Tomasz kom for otte år siden, og Hoang kom som barn.",
        },
        {
          id: "2",
          question: "Hvem hjælper sine forældre med at forstå dansk?",
          personId: "C",
          why: "Hoang har oversat for sine forældre, siden han var ti, og tager stadig med til lægen og på kommunen.",
        },
        {
          id: "3",
          question: "Hvem kan ikke arbejde i sit gamle fag lige nu?",
          personId: "B",
          why: "Grace var sygeplejerske, men må ikke arbejde som sygeplejerske, før hun består en danskprøve og får papirerne godkendt.",
        },
        {
          id: "4",
          question: "Hvem begyndte først at lære sproget efter flere år i landet?",
          personId: "A",
          why: "Tomasz lærte først dansk rigtigt, da datteren begyndte i børnehave — inden da klarede han sig på engelsk.",
        },
        {
          id: "5",
          question: "Hvem synes, det er svært ikke at kunne udtrykke sig?",
          personId: "B",
          why: "Grace beskriver, hvor mærkeligt det er at gå fra at være en, alle spurgte til råds, til ikke at kunne sige en hel sætning.",
        },
      ],
    },
  },
];
