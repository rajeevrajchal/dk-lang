import type { ExerciseVariant } from "@/types";

// Læsning, Opgave 2 — find the one sentence per section that does not belong.
//
// The important thing copied from the real modultest is WHAT makes a sentence
// wrong. It is not off-topic — it is topically plausible but contradicts the
// facts around it, so the learner has to hold the paragraph in their head
// rather than spot an odd word. In the reference test the kindergarten
// paragraph says the children will do two different activities, and the wrong
// sentence claims they will all do the same thing.
//
// Shortened to 4 sections plus a worked example (the full test uses 5).

const INSTRUCTION = (title: string) => [
  `Læs teksten ${title}.`,
  "I hvert afsnit er der én sætning, der ikke passer i afsnittet.",
  "Find den sætning, der ikke passer.",
  "Se eksemplet i afsnit 0.",
];

export const READING_TASK2_VARIANTS: ExerciseVariant[] = [
  // ---------------------------------------------------------------------
  {
    variantId: "r2-bibliotek",
    category: "READING",
    taskType: "reading_task_2_wrong_sentence",
    moduleId: 2,
    topic: "Arbejde",
    title: "En dag på biblioteket",
    instruction: INSTRUCTION("En dag på biblioteket"),
    difficulty: "medium",
    content: {
      kind: "reading_task_2_wrong_sentence",
      textTitle: "En dag på biblioteket",
      example: {
        sentences: [
          "Karina er bibliotekar på et stort bibliotek i Herning.",
          "Hun har arbejdet der i ni år.",
          "Biblioteket har både bøger, film og computere, som gæsterne kan låne og bruge.",
          "Karina er især glad for at hjælpe børnene med at finde en god bog.",
          "Hun bryder sig ikke om at tale med andre mennesker.",
          "Hun kender mange af de faste gæster ved navn.",
        ],
        wrongIndex: 4,
        why: "Afsnittet fortæller, at Karina er glad for at hjælpe børnene, og at hun kender gæsterne ved navn. Så kan hun ikke samtidig lade være med at ville tale med mennesker.",
      },
      sections: [
        {
          id: "1",
          sentences: [
            "Karina møder på arbejde klokken otte om morgenen.",
            "Først sætter hun de bøger på plads, som gæsterne har afleveret dagen før.",
            "Om mandagen er der altid rigtig mange bøger, fordi biblioteket er lukket om søndagen.",
            "Derfor er mandag den dag, hvor der er mindst at lave.",
            "Klokken ni åbner biblioteket, og de første gæster kommer ind.",
          ],
          wrongIndex: 3,
          why: "Der står lige før, at der altid er rigtig mange bøger om mandagen. Så kan mandag ikke være dagen med mindst at lave.",
        },
        {
          id: "2",
          sentences: [
            "Om formiddagen kommer der mest ældre gæster.",
            "De læser aviser og drikker en kop kaffe i caféen ved indgangen.",
            "Nogle af dem bliver i flere timer og taler sammen om det, de har læst.",
            "Alle gæsterne går hjem igen efter ti minutter.",
            "Karina hjælper dem, der ikke kan finde det, de søger.",
          ],
          wrongIndex: 3,
          why: "Afsnittet siger, at nogle bliver i flere timer og taler sammen. Så går alle ikke hjem efter ti minutter.",
        },
        {
          id: "3",
          sentences: [
            "Klokken to kommer der en klasse fra den nærmeste skole.",
            "Børnene skal låne bøger til et projekt om dyr.",
            "Karina har fundet tyve bøger frem til dem på forhånd.",
            "Læreren deler børnene op i små grupper, så de kan arbejde i ro.",
            "Børnene skal alle sammen læse den samme bog på én gang.",
            "Bagefter låner mange af dem en ekstra bog med hjem.",
          ],
          wrongIndex: 4,
          why: "Karina har fundet tyve bøger frem, og børnene arbejder i små grupper. Så læser de ikke alle den samme bog på én gang.",
        },
        {
          id: "4",
          sentences: [
            "Klokken fem lukker biblioteket, men Karina bliver lidt længere.",
            "Hun skal planlægge en læseklub for voksne, som starter i næste uge.",
            "Ti personer har allerede meldt sig til, og der er plads til femten.",
            "Ingen har endnu vist interesse for læseklubben.",
            "Karina glæder sig til at høre, hvad de synes om den første bog.",
          ],
          wrongIndex: 3,
          why: "Ti personer har allerede meldt sig til. Så er det forkert, at ingen har vist interesse.",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r2-flytning",
    category: "READING",
    taskType: "reading_task_2_wrong_sentence",
    moduleId: 2,
    topic: "Hverdagsliv",
    title: "Familien flytter",
    instruction: INSTRUCTION("Familien flytter"),
    difficulty: "medium",
    content: {
      kind: "reading_task_2_wrong_sentence",
      textTitle: "Familien flytter",
      example: {
        sentences: [
          "Familien Holm har boet i den samme lejlighed i tolv år.",
          "Nu er der blevet for lidt plads, fordi børnene er blevet store.",
          "De to drenge deler et lille værelse og skændes tit om pladsen.",
          "Derfor har familien besluttet at flytte til et større sted.",
          "De synes, at lejligheden er alt for stor til dem.",
          "De har set på boliger i tre måneder.",
        ],
        wrongIndex: 4,
        why: "Hele afsnittet handler om, at der er for lidt plads. Så kan de ikke synes, at lejligheden er for stor.",
      },
      sections: [
        {
          id: "1",
          sentences: [
            "I lørdags kørte familien ud for at se et hus i en lille by uden for Vejle.",
            "Huset har fire værelser og en have med et stort æbletræ.",
            "Drengene løb rundt i haven, mens forældrene talte med mægleren.",
            "Der var ingen have ved huset overhovedet.",
            "Prisen er lidt højere, end familien havde regnet med.",
          ],
          wrongIndex: 3,
          why: "Der står, at huset har en have med et æbletræ, og at drengene løb rundt i haven. Så kan der ikke mangle en have.",
        },
        {
          id: "2",
          sentences: [
            "Mor Line er glad for huset, men hun tænker på transporten.",
            "Hun arbejder i Vejle og skal køre 25 kilometer hver vej.",
            "Der går kun én bus om morgenen og én om eftermiddagen.",
            "Derfor skal familien nok købe endnu en bil.",
            "Der er masser af busser hele dagen, så hun behøver ikke en bil.",
          ],
          wrongIndex: 4,
          why: "Afsnittet siger, at der kun går én bus om morgenen og én om eftermiddagen, og at de derfor skal købe en bil mere.",
        },
        {
          id: "3",
          sentences: [
            "Drengene skal skifte skole, hvis familien flytter.",
            "Den ældste, Oscar, synes, det er svært at forlade sine venner.",
            "Han har gået i den samme klasse siden 0. klasse.",
            "Oscar kender ingen på sin nuværende skole.",
            "Den yngste, Elliot, glæder sig derimod til at møde nye børn.",
          ],
          wrongIndex: 3,
          why: "Oscar synes, det er svært at forlade sine venner, og han har gået i klassen siden 0. klasse. Så kender han bestemt nogen.",
        },
        {
          id: "4",
          sentences: [
            "Familien har sagt ja til huset og skal flytte den 1. november.",
            "De har lånt en trailer af en nabo og skal selv pakke alting.",
            "Line har allerede pakket seks kasser med bøger og køkkenting.",
            "De har bestilt et flyttefirma, der klarer det hele for dem.",
            "Drengene har lovet at pakke deres eget legetøj ned i weekenden.",
          ],
          wrongIndex: 3,
          why: "De har lånt en trailer og skal selv pakke, og Line er allerede gået i gang. Så har de ikke bestilt et flyttefirma til at klare det hele.",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------
  {
    variantId: "r2-sundhed",
    category: "READING",
    taskType: "reading_task_2_wrong_sentence",
    moduleId: 2,
    topic: "Sundhed",
    title: "Malik begynder at træne",
    instruction: INSTRUCTION("Malik begynder at træne"),
    difficulty: "medium",
    content: {
      kind: "reading_task_2_wrong_sentence",
      textTitle: "Malik begynder at træne",
      example: {
        sentences: [
          "Malik er 38 år og arbejder på et kontor i Aalborg.",
          "Han sidder ned næsten hele dagen foran en computer.",
          "Om aftenen er han træt og ser mest fjernsyn.",
          "Han løber en time hver eneste morgen før arbejde.",
          "Sidste måned var han til lægen, fordi han sov dårligt.",
        ],
        wrongIndex: 3,
        why: "Afsnittet beskriver en mand, der sidder ned hele dagen og er træt om aftenen. En times løb hver morgen passer ikke ind i det billede.",
      },
      sections: [
        {
          id: "1",
          sentences: [
            "Lægen sagde, at Malik skal bevæge sig mere i hverdagen.",
            "Hun foreslog, at han begynder med noget helt let.",
            "Han skal ikke gå i fitnesscenter med det samme.",
            "Lægen anbefalede ham at træne hårdt fem gange om ugen fra starten.",
            "Malik besluttede at cykle på arbejde i stedet for at tage bussen.",
          ],
          wrongIndex: 3,
          why: "Lægen sagde netop, at han skal begynde med noget helt let og ikke gå i fitnesscenter med det samme.",
        },
        {
          id: "2",
          sentences: [
            "Den første uge var svær.",
            "Der er otte kilometer fra Maliks hus til kontoret.",
            "Han var forpustet, og benene gjorde ondt om aftenen.",
            "Turen var helt uden problemer for ham fra dag ét.",
            "Men efter fjorten dage begyndte det at føles nemmere.",
          ],
          wrongIndex: 3,
          why: "Den første uge var svær, han var forpustet, og benene gjorde ondt. Så var turen ikke uden problemer fra dag ét.",
        },
        {
          id: "3",
          sentences: [
            "Maliks kollega Sanne cykler også på arbejde.",
            "Nu kører de sammen tre gange om ugen.",
            "De taler om alt muligt undervejs, og tiden går hurtigt.",
            "Malik cykler altid helt alene og taler ikke med nogen.",
            "I weekenden har de aftalt at tage på en længere tur langs fjorden.",
          ],
          wrongIndex: 3,
          why: "Afsnittet handler om, at han cykler sammen med Sanne tre gange om ugen, og at de taler undervejs.",
        },
        {
          id: "4",
          sentences: [
            "Efter tre måneder var Malik til lægen igen.",
            "Han sover bedre om natten og har mere energi på arbejde.",
            "Han har også tabt fire kilo, uden at han har ændret sin mad.",
            "Lægen kunne ikke se nogen forskel på ham.",
            "Nu vil Malik prøve at svømme en gang om ugen om vinteren.",
          ],
          wrongIndex: 3,
          why: "Han sover bedre, har mere energi og har tabt fire kilo. Så er der tydelig forskel at se.",
        },
      ],
    },
  },
];
