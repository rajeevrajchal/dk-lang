import type { TheoryLesson } from "@/lib/content-gen/theory";

// Writing lessons: a text type taken apart, then handed back a piece at a
// time.
//
// The difference from a writing task in Class or Mock is the order of events.
// A task says "write an email" and scores what comes back. A lesson shows a
// finished email first, names what each line is doing, and only then asks for
// one — and the exercise ladder does the handing back:
//
//   recognition            find the greeting in a finished text
//   selection              choose the phrase that does this job
//   ordering               put a scrambled email back in order
//   controlled_production  write one line into a skeleton
//   free_production        write the whole thing yourself
//
// That is the existing ladder from course-types.ts doing exactly what it was
// built for. No new exercise kinds were needed.

export const WRITING_LESSONS: TheoryLesson[] = [
  // -------------------------------------------------------------------
  // Chapter 5 — questions. A short message is the first thing you will
  // actually have to write in Danish, and it is mostly questions.
  // -------------------------------------------------------------------
  {
    slug: "writing-en-kort-besked",
    title: "Writing: a short message",
    danishName: "At skrive en kort besked",
    kind: "writing",
    tier: 1,
    constructCodes: [],
    pd3Modules: [1, 2],
    summary:
      "The shortest useful thing you can write in Danish: four lines to say who you are, what you need and when. Get this shape and you can text a colleague, a landlord or a teacher.",
    primer:
      "A Danish message is shorter than you think it should be. There is no 'I hope this finds you well'. You greet, you say the thing, you ask, you sign off. Four lines is normal and polite.",
    learningObjectives: [
      "Write a four-line message with a greeting, a reason, a question and a sign-off",
      "Choose between 'Hej' and 'Kære', and between 'Hilsen' and 'Venlig hilsen'",
      "Ask one clear question in Danish",
    ],
    canDo: "Write a short message asking somebody for something.",
    sections: [
      {
        heading: "The four moves",
        body: "Every short Danish message does the same four things in the same order: greet, say why you are writing, ask what you need, sign off. If a message is confusing, it is almost always because one of the four is missing — usually the reason.",
      },
      {
        heading: "How formal?",
        body: "'Hej' plus a first name is right for almost everybody in Denmark, including your teacher and your boss. Save 'Kære' for when you do not know the person's name or you are writing to an institution. Danish is far less formal than most learners expect, and being too formal is its own kind of mistake.",
      },
    ],
    pitfalls: [
      "Do not write 'Hej Maria,' with a comma — Danish does not put one there.",
      "'Tak på forhånd' (thanks in advance) is normal and not pushy in Danish.",
      "Sign off with 'Hilsen' to somebody you know, 'Venlig hilsen' to somebody you do not.",
      "Danish questions do not need 'do': 'Kan du hjælpe?', not 'Gør du kan hjælpe?'",
    ],
    writingModel: {
      situation:
        "Your daughter is ill and cannot come to school tomorrow. You need to tell her teacher, and ask whether she can get the homework.",
      example:
        "Hej Mette\n\nMin datter Sara er syg, og hun kommer ikke i skole i morgen.\n\nKan hun få lektierne på mail?\n\nTak på forhånd.\n\nHilsen\nOmar (Saras far)",
      parts: [
        {
          label: "Greeting",
          danish: "Hej Mette",
          english: "Hi Mette",
          note: "First name, no comma, no title. This is right for a teacher in Denmark — 'Kære fru Nielsen' would sound strange.",
          alternatives: ["Hej Mette", "Kære Mette", "Hej"],
        },
        {
          label: "Why you are writing",
          danish: "Min datter Sara er syg, og hun kommer ikke i skole i morgen.",
          english: "My daughter Sara is ill, and she is not coming to school tomorrow.",
          note: "The fact first, the consequence second, joined with 'og'. Notice 'kommer ikke' — in a main clause 'ikke' goes after the verb.",
          alternatives: [
            "Sara er desværre syg i dag.",
            "Sara kan ikke komme i skole i morgen, fordi hun er syg.",
          ],
        },
        {
          label: "What you want",
          danish: "Kan hun få lektierne på mail?",
          english: "Can she have the homework by email?",
          note: "A yes/no question: the verb 'Kan' comes first, the subject 'hun' second. No question word is needed.",
          alternatives: ["Kan du sende lektierne?", "Er det muligt at få lektierne på mail?"],
        },
        {
          label: "Politeness",
          danish: "Tak på forhånd.",
          english: "Thanks in advance.",
          note: "Optional, but very common in Danish and not at all pushy. One line on its own.",
          alternatives: ["Tak på forhånd.", "Mange tak.", "Tak for hjælpen."],
        },
        {
          label: "Sign-off",
          danish: "Hilsen\nOmar (Saras far)",
          english: "Regards, Omar (Sara's father)",
          note: "'Hilsen' for somebody you deal with regularly. Adding who you are in brackets helps when the reader knows your child but not you.",
          alternatives: ["Hilsen Omar", "Venlig hilsen Omar", "Mvh Omar"],
        },
      ],
      template:
        "Hej [navn]\n\n[Hvorfor skriver du? En eller to sætninger.]\n\n[Hvad vil du gerne have? Et spørgsmål.]\n\nTak på forhånd.\n\nHilsen\n[dit navn]",
      checklist: [
        "Greeting with the person's first name",
        "One or two sentences saying why you are writing",
        "One clear question",
        "A sign-off and your name",
        "No more than about six lines in total",
      ],
    },
    exercises: [
      {
        id: "wr-besked-1",
        kind: "recognition",
        instruction: "Which word is the greeting?",
        sentence: "Hej Mette Min datter er syg Hilsen Omar",
        answerIndex: 0,
        explanation:
          "'Hej'. In Danish it opens a message to almost anybody — a friend, a teacher, a landlord.",
      },
      {
        id: "wr-besked-2",
        kind: "selection",
        instruction: "You are writing to your child's teacher, who you speak to every week. Which sign-off?",
        sentence: "___\nOmar",
        options: ["Hilsen", "Med venlig hilsen og de bedste ønsker", "Kære"],
        answer: "Hilsen",
        explanation:
          "'Hilsen' — short and normal between people who deal with each other regularly. The long one sounds like a formal letter, and 'Kære' opens a message rather than closing it.",
      },
      {
        id: "wr-besked-3",
        kind: "selection",
        instruction: "Complete the reason. Your daughter is not coming to school.",
        sentence: "Hun ___ i skole i morgen.",
        options: ["kommer ikke", "ikke kommer", "kommer ingen"],
        answer: "kommer ikke",
        explanation:
          "This is a main clause, so 'ikke' comes after the verb: 'hun kommer ikke'. 'ikke kommer' would only be right inside a subordinate clause, after something like 'fordi'.",
      },
      {
        id: "wr-besked-4",
        kind: "ordering",
        instruction: "Put this message back in the right order.",
        scrambled: [
          "Kan",
          "hun",
          "få",
          "lektierne",
          "på",
          "mail?",
        ],
        answer: ["Kan", "hun", "få", "lektierne", "på", "mail?"],
        explanation:
          "A yes/no question puts the verb first: 'Kan hun få ...?'. There is no Danish equivalent of English 'do' in questions.",
      },
      {
        id: "wr-besked-5",
        kind: "controlled_production",
        instruction:
          "Write the 'why you are writing' line. You cannot come to Danish class on Thursday because you are working.",
        prompt: "Jeg ... (Skriv én sætning: du kan ikke komme til undervisning på torsdag, fordi du arbejder.)",
        acceptedAnswers: [
          "Jeg kan ikke komme til undervisning på torsdag, fordi jeg arbejder",
          "Jeg kan ikke komme til undervisning på torsdag, fordi jeg arbejder.",
          "Jeg kan ikke komme på torsdag, fordi jeg arbejder",
          "Jeg kan ikke komme på torsdag, fordi jeg arbejder.",
          "Jeg kan desværre ikke komme til undervisning på torsdag, fordi jeg arbejder",
        ],
        hint: "Main clause first with 'ikke' after the verb, then 'fordi' for the reason.",
        explanation:
          "'Jeg kan ikke komme til undervisning på torsdag, fordi jeg arbejder.' Notice the two halves: 'kan ikke' in the main clause, and then the reason after 'fordi'.",
      },
      {
        id: "wr-besked-6",
        kind: "free_production",
        instruction:
          "Now write the whole message yourself, using the template. You want to view the flat from the housing advert.",
        prompt:
          "Skriv en kort besked til Karin om lejligheden. Du vil gerne se den. Spørg, hvornår det er muligt.",
        checklist: [
          "Greeting with her name",
          "Says which flat you mean and that you are interested",
          "Asks when you can see it",
          "Sign-off with your name",
          "Six lines or fewer",
        ],
        modelAnswer:
          "Hej Karin\n\nJeg har set din annonce om lejligheden i Aarhus V. Jeg er meget interesseret.\n\nHvornår er det muligt at se den?\n\nTak på forhånd.\n\nHilsen\nSara Ahmadi",
      },
    ],
  },

  // -------------------------------------------------------------------
  // Chapter 10 — the future and modal verbs. An email that changes an
  // arrangement needs 'kan', 'skal' and a proposal, which is exactly what
  // that chapter teaches.
  // -------------------------------------------------------------------
  {
    slug: "writing-en-email",
    title: "Writing: an email that changes an arrangement",
    danishName: "At skrive en e-mail",
    kind: "writing",
    tier: 2,
    constructCodes: ["modal-verbs", "future-tense"],
    pd3Modules: [2, 3],
    summary:
      "The email you will write most often: something no longer works, and you need to propose something else. Six moves, and a rule about apologising that English speakers usually get wrong.",
    primer:
      "In English you would write three sentences of apology. In Danish, 'desværre' does the whole job in one word. Over-apologising in Danish reads as strange rather than polite.",
    learningObjectives: [
      "Write an email that cancels something and proposes an alternative",
      "Use 'desværre' instead of a paragraph of apology",
      "Propose rather than demand, using 'Kan vi ...?' and 'Vil det passe ...?'",
    ],
    canDo: "Write an email cancelling an arrangement and suggesting a new time.",
    sections: [
      {
        heading: "The six moves",
        body: "Greeting, the problem, the reason, the proposal, a way out for the other person, sign-off. The fifth is the one people forget: a Danish email that proposes something almost always leaves the reader an easy way to say no.",
      },
      {
        heading: "Subject lines",
        body: "Keep it factual and short. 'Møde tirsdag' is a better Danish subject line than 'Vedrørende vores aftale på tirsdag den 14.'. Danish written style rewards plainness.",
      },
      {
        heading: "Apologising once",
        body: "'Desværre' placed after the verb carries the whole apology: 'Jeg kan desværre ikke komme'. You may add 'Beklager' as a single word. What you should not do is write three sentences explaining how sorry you are — it reads as evasive rather than polite.",
      },
    ],
    pitfalls: [
      "'Jeg er ked af det' means you are genuinely upset, not 'I'm sorry to bother you'. For an email, 'desværre' or 'beklager' is what you want.",
      "'Kan vi flytte mødet?' proposes. 'Vi skal flytte mødet' instructs. Know which one you are doing.",
      "'passer' is the verb for a time suiting somebody: 'Passer det dig?' = Does that work for you?",
      "After 'Venlig hilsen' there is no comma — just a line break and your name.",
    ],
    writingModel: {
      situation:
        "You have a meeting with your contact Maria on Tuesday, but you have to take your son to the doctor. You want to move it to Wednesday.",
      example:
        "Emne: Møde tirsdag\n\nHej Maria\n\nJeg kan desværre ikke komme til mødet på tirsdag.\n\nJeg skal på lægen med min søn.\n\nKan vi flytte mødet til onsdag? Jeg kan hele dagen.\n\nHvis onsdag ikke passer dig, finder vi en anden dag.\n\nVenlig hilsen\nRajeev",
      parts: [
        {
          label: "Subject",
          danish: "Emne: Møde tirsdag",
          english: "Subject: Meeting Tuesday",
          note: "Short and factual. The reader should know what the email is about before opening it.",
          alternatives: ["Møde tirsdag", "Aftale tirsdag den 14."],
        },
        {
          label: "Greeting",
          danish: "Hej Maria",
          english: "Hi Maria",
          note: "First name. 'Kære Maria' is warmer and also fine; both are normal at work.",
          alternatives: ["Hej Maria", "Kære Maria"],
        },
        {
          label: "The problem",
          danish: "Jeg kan desværre ikke komme til mødet på tirsdag.",
          english: "Unfortunately I cannot come to the meeting on Tuesday.",
          note: "'desværre' sits after the verb and does all the apologising the email needs. The whole message is in this line, which is why it comes first.",
          alternatives: [
            "Jeg må desværre aflyse vores møde på tirsdag.",
            "Desværre kan jeg ikke komme på tirsdag.",
          ],
        },
        {
          label: "The reason",
          danish: "Jeg skal på lægen med min søn.",
          english: "I have to take my son to the doctor.",
          note: "One sentence. Danish work emails give a reason but do not justify at length — 'skal' is enough to show it is not optional.",
          alternatives: ["Jeg har en aftale, jeg ikke kan flytte.", "Jeg skal til lægen med min søn."],
        },
        {
          label: "The proposal",
          danish: "Kan vi flytte mødet til onsdag? Jeg kan hele dagen.",
          english: "Can we move the meeting to Wednesday? I am free all day.",
          note: "A question, not an instruction — and then your own availability, so the other person can answer in one line.",
          alternatives: [
            "Kan vi mødes onsdag i stedet?",
            "Vil onsdag passe dig bedre?",
          ],
        },
        {
          label: "A way out",
          danish: "Hvis onsdag ikke passer dig, finder vi en anden dag.",
          english: "If Wednesday does not suit you, we will find another day.",
          note: "'hvis' opens a subordinate clause, so 'ikke' goes in front of the verb: 'hvis onsdag ikke passer'. Then the main clause follows with its verb first, because the subordinate clause took position 1.",
          alternatives: ["Ellers finder vi en anden dag.", "Sig til, hvis det ikke passer."],
        },
        {
          label: "Sign-off",
          danish: "Venlig hilsen\nRajeev",
          english: "Kind regards, Rajeev",
          note: "The neutral sign-off for work. No comma after it — just a line break.",
          alternatives: ["Venlig hilsen", "Med venlig hilsen", "Mvh"],
        },
      ],
      template:
        "Emne: [kort og konkret]\n\nHej [navn]\n\nJeg kan desværre ikke [hvad du ikke kan].\n\n[Hvorfor — én sætning.]\n\nKan vi [dit forslag]? [Hvornår du kan.]\n\nHvis det ikke passer dig, [en vej ud].\n\nVenlig hilsen\n[dit navn]",
      checklist: [
        "A short, factual subject line",
        "'desværre' once — and no other apology",
        "One sentence of reason, not three",
        "A proposal phrased as a question",
        "A way for the other person to say no",
        "'Venlig hilsen' and your name",
      ],
    },
    exercises: [
      {
        id: "wr-email-1",
        kind: "selection",
        instruction: "Where does 'desværre' go?",
        sentence: "Jeg kan ___ ikke komme til mødet.",
        options: ["desværre", "meget ked af det", "beklager"],
        answer: "desværre",
        explanation:
          "'desværre' goes straight after the verb and does the whole apology. 'Jeg er ked af det' means you are genuinely upset — too strong for a moved meeting.",
      },
      {
        id: "wr-email-2",
        kind: "matching",
        instruction: "Match each line of the example email to the job it does.",
        pairs: [
          { left: "Hej Maria", right: "Greeting" },
          { left: "Jeg kan desværre ikke komme", right: "The problem" },
          { left: "Jeg skal på lægen med min søn", right: "The reason" },
          { left: "Kan vi flytte mødet til onsdag?", right: "The proposal" },
          { left: "Venlig hilsen", right: "Sign-off" },
        ],
        explanation:
          "Five moves, in this order, every time. Once you can see them in somebody else's email you can build your own.",
      },
      {
        id: "wr-email-3",
        kind: "ordering",
        instruction: "Build the way out: 'If Wednesday does not suit you, we will find another day.'",
        scrambled: ["passer", "onsdag", "vi", "ikke", "Hvis", "dag", "dig,", "finder", "en", "anden"],
        answer: [
          "Hvis",
          "onsdag",
          "ikke",
          "passer",
          "dig,",
          "finder",
          "vi",
          "en",
          "anden",
          "dag",
        ],
        explanation:
          "Two things at once. Inside the 'hvis' clause, 'ikke' comes before the verb. And because that whole clause fills position 1, the main clause has to start with its verb: 'finder vi', not 'vi finder'.",
      },
      {
        id: "wr-email-4",
        kind: "controlled_production",
        instruction:
          "Write the proposal line. You want to suggest Friday instead, and you are free in the morning.",
        prompt: "Kan vi ... ? (Foreslå fredag, og sig at du kan om formiddagen.)",
        acceptedAnswers: [
          "Kan vi flytte mødet til fredag? Jeg kan om formiddagen",
          "Kan vi flytte mødet til fredag? Jeg kan om formiddagen.",
          "Kan vi mødes fredag? Jeg kan om formiddagen",
          "Kan vi mødes fredag? Jeg kan om formiddagen.",
          "Kan vi flytte mødet til fredag? Jeg kan godt om formiddagen.",
        ],
        hint: "Start with 'Kan vi ...?' and then say when you are free.",
        explanation:
          "'Kan vi flytte mødet til fredag? Jeg kan om formiddagen.' The question proposes; the second sentence saves the reader from having to ask.",
      },
      {
        id: "wr-email-5",
        kind: "free_production",
        instruction: "Write the whole email yourself.",
        prompt:
          "Du skal til tandlæge på torsdag, men du har aftalt at hjælpe din kollega Peter med et projekt samme dag. Skriv en e-mail til Peter: aflys, forklar kort hvorfor, og foreslå en anden dag.",
        checklist: [
          "Subject line",
          "Greeting with his name",
          "The problem, with 'desværre'",
          "One sentence of reason",
          "A proposal as a question",
          "A way out for Peter",
          "'Venlig hilsen' and your name",
        ],
        modelAnswer:
          "Emne: Projektet torsdag\n\nHej Peter\n\nJeg kan desværre ikke hjælpe dig med projektet på torsdag.\n\nJeg skal til tandlæge om eftermiddagen.\n\nKan vi tage det på mandag i stedet? Jeg kan hele dagen.\n\nHvis mandag ikke passer dig, så sig til, så finder vi en anden dag.\n\nVenlig hilsen\nSara",
      },
      {
        id: "wr-email-6",
        kind: "communication",
        instruction:
          "Say the same thing out loud, as a phone call rather than an email. Notice how much less formal it gets.",
        prompt:
          "Ring til Peter og sig det samme: du kan ikke på torsdag, hvorfor, og hvad du foreslår i stedet.",
        demand: "factual",
        usefulPhrases: [
          "Hej Peter, det er ...",
          "Jeg kan desværre ikke på torsdag.",
          "Jeg skal til tandlæge.",
          "Kan vi tage det på mandag i stedet?",
          "Passer det dig?",
        ],
      },
    ],
  },
];
