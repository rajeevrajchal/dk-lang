import { z } from "zod";

// Output schemas for LLM-generated exercises.
//
// These do double duty: they are handed to the Messages API as the structured
// output format (so the model is constrained to the right shape), and they are
// the first validation gate on the way back. Shape alone isn't enough though —
// a structurally perfect Opgave 3 can still have an answer that isn't in its
// own word bank, so every schema is followed by the semantic checks in
// validate.ts before a generated exercise is ever shown to a learner.
//
// Field names match the hand-authored variant types in @/types/exercises so a
// generated exercise and an authored one are the same thing downstream.

export const Task1Schema = z.object({
  title: z.string(),
  example: z.object({
    personText: z.string(),
    adId: z.string(),
  }),
  people: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .length(4),
  ads: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
      })
    )
    .length(7),
  answers: z.array(
    z.object({
      personId: z.string(),
      adId: z.string(),
      rationale: z.string(),
    })
  ),
});

export const Task2Schema = z.object({
  title: z.string(),
  textTitle: z.string(),
  example: z.object({
    sentences: z.array(z.string()).min(5).max(7),
    wrongIndex: z.number().int(),
    why: z.string(),
  }),
  sections: z
    .array(
      z.object({
        id: z.string(),
        sentences: z.array(z.string()).min(4).max(6),
        wrongIndex: z.number().int(),
        why: z.string(),
      })
    )
    .length(4),
});

export const Task3Schema = z.object({
  title: z.string(),
  textTitle: z.string(),
  exampleWord: z.string(),
  exampleSentence: z.string(),
  /** Text chunks either side of each gap; must be exactly answers.length + 1. */
  textSegments: z.array(z.string()).length(8),
  answers: z
    .array(
      z.object({
        word: z.string(),
        rationale: z.string(),
      })
    )
    .length(7),
  /** The seven answers + the example word + exactly four unused words. */
  wordBank: z.array(z.string()).length(12),
});

export const Task4Schema = z.object({
  title: z.string(),
  heading: z.string(),
  people: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        text: z.string(),
      })
    )
    .length(3),
  example: z.object({
    question: z.string(),
    personId: z.string(),
  }),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string(),
        personId: z.string(),
        why: z.string(),
      })
    )
    .length(5),
});

export const WritingSchema = z.object({
  title: z.string(),
  situation: z.string(),
  task: z.string(),
  minWords: z.number().int(),
  incomingEmail: z
    .object({
      from: z.string(),
      subject: z.string(),
      body: z.string(),
      questions: z.array(z.string()).min(3).max(4),
    })
    .nullable(),
  answerHeader: z
    .object({
      to: z.string().nullable(),
      subject: z.string().nullable(),
    })
    .nullable(),
  mustInclude: z.array(z.string()).min(4).max(6),
});

export const SpeakingSchema = z.object({
  title: z.string(),
  situation: z.string().nullable(),
  questions: z.array(z.string()).min(4).max(5),
  followUps: z.array(z.string()).min(3).max(4),
  usefulPhrases: z
    .array(
      z.object({
        danish: z.string(),
        english: z.string(),
      })
    )
    .min(4)
    .max(5),
});

// ---------------------------------------------------------------------------
// Speaking opgave formats
//
// These extend SpeakingSchema rather than replacing it: questions, followUps
// and usefulPhrases stay required, so a generated opgave still satisfies
// SpeakingContent and still renders in the existing Speaking component even
// before any new UI is involved.
//
// `stages` is deliberately NOT generated. Stages are task structure, which the
// app owns (speaking-patterns.ts) — asking the model for them would let it
// invent a different shape of opgave each time.
// ---------------------------------------------------------------------------

const SpeakingBase = {
  title: z.string(),
  questions: z.array(z.string()).min(4).max(6),
  followUps: z.array(z.string()).min(3).max(5),
  usefulPhrases: z
    .array(z.object({ danish: z.string(), english: z.string() }))
    .min(4)
    .max(6),
};

export const MindmapSchema = z.object({
  ...SpeakingBase,
  mindmap: z.object({
    title: z.string(),
    /** Short keyword prompts, like "dage / tid" — not full questions. */
    categories: z.array(z.string()).min(5).max(6),
  }),
});

export const InformationGapSchema = z.object({
  ...SpeakingBase,
  situation: z.string(),
  informationGap: z.object({
    sharedContext: z.string(),
    candidate: z.object({
      holds: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(5),
      mustFindOut: z.array(z.string()).min(3).max(5),
    }),
    partner: z.object({
      holds: z.array(z.object({ label: z.string(), value: z.string() })).min(3).max(5),
      mustFindOut: z.array(z.string()).min(3).max(5),
    }),
    requiredQuestions: z.array(z.string()).min(3).max(5),
  }),
});

export const PreparedTopicSchema = z.object({
  ...SpeakingBase,
  /** Two topics are offered; one is drawn at run time. */
  preparedTopics: z
    .array(
      z.object({
        title: z.string(),
        prompts: z.array(z.string()).min(4).max(6),
      })
    )
    .length(2),
});

export const PicturePreferenceSchema = z.object({
  ...SpeakingBase,
  preferenceTopic: z.string(),
  preferenceOptions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        /** Stands in for the picture on the paper test. */
        description: z.string(),
      })
    )
    .length(4),
});

/** One examiner or partner turn, requested live during a conversation. */
export const ExaminerTurnSchema = z.object({
  /** The question itself, in Danish. */
  question: z.string(),
  /** Which coverage target it is aimed at, if any. */
  target: z.string().nullable(),
  /** Targets the candidate's last answer actually covered. */
  coveredByLastAnswer: z.array(z.string()),
  /** True once this stage has been taken as far as it usefully goes. */
  stageComplete: z.boolean(),
});

