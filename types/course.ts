// The Class curriculum: a Danish grammar course you can work through from
// Chapter 1.
//
// This sits ON TOP of the existing theory lessons rather than replacing them.
// A chapter references lesson slugs; the lessons themselves stay where they
// are in lib/content-gen/theory.ts. That is what makes this a migration by
// assignment instead of a rewrite — every existing lesson keeps its slug, its
// URL and its content.
//
// Grammar is the backbone. The PD3 modules are milestones layered over it:
// a chapter declares which modules it supports, and one grammar point can
// support several (present tense matters at Modul 1, 2 and 3 alike — what
// changes is what you are expected to DO with it).

import type {
  COURSE_STAGES,
  EXERCISE_KINDS,
  LESSON_KINDS,
  SUPPORT_LANGUAGE,
} from "@/lib/curriculum/course-constants";
import type { CommunicationDemand } from "./exercises";

// ---------------------------------------------------------------------------
// Progression stages
//
// Difficulty is not "easy/medium/hard". It is what the learner is being asked
// to handle: single words, then sentences, then questions, then negation, and
// so on. A chapter declares the stage it lives at, which is what decides how
// much Danish the explanations use and how demanding the exercises get.
// ---------------------------------------------------------------------------

export type CourseStage = (typeof COURSE_STAGES)[number];

/**
 * How much Danish the explanations should use. An absolute beginner cannot
 * read a grammar explanation in Danish, so early chapters explain in English
 * with Danish examples, and the balance shifts as the course goes on.
 */
export type SupportLanguage = (typeof SUPPORT_LANGUAGE)[number];

// ---------------------------------------------------------------------------
// Exercise ladder
//
// The same seven rungs are reused by every lesson, which is what stops each
// chapter inventing its own exercise style. Early lessons stay near the top of
// the ladder; later ones push towards producing language rather than
// recognising it.
// ---------------------------------------------------------------------------

export type ExerciseKind = (typeof EXERCISE_KINDS)[number];

interface ExerciseBase {
  id: string;
  /** What the learner is asked to do, in their interface language. */
  instruction: string;
  /** Shown after answering — why the answer is what it is. */
  explanation?: string;
}

/** "Which word is the verb?" — the learner picks one token of a sentence. */
export interface RecognitionExercise extends ExerciseBase {
  kind: "recognition";
  sentence: string;
  /** Index into sentence.split(" ") of the word being asked about. */
  answerIndex: number;
}

/** A gap with options — the classic first productive step. */
export interface SelectionExercise extends ExerciseBase {
  kind: "selection";
  /** Sentence with ___ where the gap is. */
  sentence: string;
  options: string[];
  answer: string;
}

export interface MatchingExercise extends ExerciseBase {
  kind: "matching";
  pairs: { left: string; right: string }[];
}

/** Scrambled words the learner puts in order — word order, made physical. */
export interface OrderingExercise extends ExerciseBase {
  kind: "ordering";
  scrambled: string[];
  answer: string[];
}

/** Produce a specific answer; several phrasings may be acceptable. */
export interface ControlledProductionExercise extends ExerciseBase {
  kind: "controlled_production";
  prompt: string;
  /** All acceptable answers, compared loosely (case/punctuation-insensitive). */
  acceptedAnswers: string[];
  hint?: string;
}

/** Write your own — checked against guidance, not an answer key. */
export interface FreeProductionExercise extends ExerciseBase {
  kind: "free_production";
  prompt: string;
  /** What a good answer contains, for the learner to check themselves. */
  checklist: string[];
  /** A worked answer to compare against, shown after they try. */
  modelAnswer?: string;
}

/** Say something about your own life — the bridge to the Practice Zone. */
export interface CommunicationExercise extends ExerciseBase {
  kind: "communication";
  prompt: string;
  /** The demand this rehearses, shared with the speaking engine. */
  demand: CommunicationDemand;
  usefulPhrases?: string[];
}

export type LessonExercise =
  | RecognitionExercise
  | SelectionExercise
  | MatchingExercise
  | OrderingExercise
  | ControlledProductionExercise
  | FreeProductionExercise
  | CommunicationExercise;

// ---------------------------------------------------------------------------
// Lesson kinds
//
// Everything written before this existed is a grammar lesson, so that is the
// default and nothing has to be relabelled. The kind decides which sections a
// lesson renders — a reading lesson leads with its text, a writing lesson
// leads with a worked example and its structure — not what a lesson is allowed
// to contain. A grammar lesson can still carry a text, and usually should.
// ---------------------------------------------------------------------------

export type LessonKind = (typeof LESSON_KINDS)[number];

// ---------------------------------------------------------------------------
// Writing lessons
//
// A writing lesson teaches a text type by showing one, naming its parts, and
// then handing the learner progressively less of it — which is why the model
// is a list of labelled parts rather than a prompt and a word count.
// ---------------------------------------------------------------------------

/** One labelled move in a text: the greeting, the reason, the request. */
export interface WritingPart {
  /** What this part is for, e.g. "Greeting", "Reason for writing". */
  label: string;
  /** The line(s) from the worked example that do this job. */
  danish: string;
  english: string;
  /** Why it is phrased this way, and what else could go here. */
  note?: string;
  /** Phrases that do the same job, for the learner to reuse. */
  alternatives?: string[];
}

export interface WritingModel {
  /** The situation the example answers. */
  situation: string;
  /** The finished text, so the learner sees the whole before the parts. */
  example: string;
  /** The same text, taken apart. Order is the order it is written in. */
  parts: WritingPart[];
  /** The skeleton to write into, with the parts named but empty. */
  template?: string;
  /** What a good attempt contains — the learner checks their own work. */
  checklist: string[];
}

// ---------------------------------------------------------------------------
// Curriculum hierarchy
// ---------------------------------------------------------------------------

/**
 * A Topic teaches one concept, small enough for a single sitting. It points at
 * a lesson by slug — either one of the existing theory lessons or one written
 * for the course.
 */
export interface CourseTopic {
  id: string;
  title: string;
  /** Slug of the lesson that teaches it (THEORY_BY_SLUG). */
  lessonSlug: string;
  /** One line: what you will be able to do afterwards. */
  canDo: string;
}

export interface CourseChapter {
  id: string;
  /** Position in the course; Chapter 1 is where an absolute beginner starts. */
  number: number;
  title: string;
  danishTitle: string;
  /** Why this chapter is worth doing, in plain language. */
  intro: string;
  stage: CourseStage;
  supportLanguage: SupportLanguage;
  topics: CourseTopic[];
  /** Chapter ids that must be done first. Empty for Chapter 1. */
  prerequisites: string[];
  /**
   * PD3 modules this chapter contributes to. A chapter can support several —
   * these are milestones, not the curriculum's spine.
   */
  supportsModules: number[];
  /**
   * Grammar from earlier chapters that this one deliberately reuses. The
   * spiral: nothing is taught once and dropped.
   */
  revisits?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  chapters: CourseChapter[];
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export type ReviewScope = "lesson" | "chapter" | "mixed";

export interface CourseReview {
  id: string;
  scope: ReviewScope;
  title: string;
  /** Chapters the review draws on. A mixed review reaches further back. */
  chapterIds: string[];
  exercises: LessonExercise[];
}
