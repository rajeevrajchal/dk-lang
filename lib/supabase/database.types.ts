// GENERATED FILE — do not edit.
//
// Produced by scripts/generate-db-types.ts from prisma/schema.prisma.
// Re-run it after any schema change:
//
//     npx tsx scripts/generate-db-types.ts
//
// Prisma still owns the schema and the migrations; it no longer runs queries.
// These are the types supabase-js uses to check them.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      "Account": {
        Row: {
          id: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string;
          refresh_token: string | null;
          access_token: string | null;
          expires_at: number | null;
          token_type: string | null;
          scope: string | null;
          id_token: string | null;
          session_state: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          type: string;
          provider: string;
          providerAccountId: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          type?: string;
          provider?: string;
          providerAccountId?: string;
          refresh_token?: string | null;
          access_token?: string | null;
          expires_at?: number | null;
          token_type?: string | null;
          scope?: string | null;
          id_token?: string | null;
          session_state?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "Attempt": {
        Row: {
          id: string;
          userId: string;
          itemId: string;
          examSessionId: string | null;
          responseJson: string;
          isCorrect: boolean;
          timeMs: number | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          itemId: string;
          examSessionId?: string | null;
          responseJson: string;
          isCorrect: boolean;
          timeMs?: number | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          itemId?: string;
          examSessionId?: string | null;
          responseJson?: string;
          isCorrect?: boolean;
          timeMs?: number | null;
          createdAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "Construct": {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          tierId: number;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description: string;
          tierId: number;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string;
          tierId?: number;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ConstructAccuracy": {
        Row: {
          id: string;
          userId: string;
          constructId: string;
          skill: string;
          correctCount: number;
          totalCount: number;
          lastAttemptAt: string | null;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          constructId: string;
          skill: string;
          correctCount?: number;
          totalCount?: number;
          lastAttemptAt?: string | null;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          constructId?: string;
          skill?: string;
          correctCount?: number;
          totalCount?: number;
          lastAttemptAt?: string | null;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ExamSession": {
        Row: {
          id: string;
          userId: string;
          moduleId: number;
          examType: string;
          status: string;
          startedAt: string;
          completedAt: string | null;
          scoresJson: string | null;
          passedJson: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          moduleId: number;
          examType: string;
          status?: string;
          startedAt?: string;
          completedAt?: string | null;
          scoresJson?: string | null;
          passedJson?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          moduleId?: number;
          examType?: string;
          status?: string;
          startedAt?: string;
          completedAt?: string | null;
          scoresJson?: string | null;
          passedJson?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ExerciseAttempt": {
        Row: {
          id: string;
          userId: string;
          moduleId: number;
          category: string;
          taskType: string;
          variantId: string;
          topic: string;
          status: string;
          examSessionId: string | null;
          orderIndex: number | null;
          generated: boolean;
          variantJson: string | null;
          explanationJson: string | null;
          speakingStateJson: string | null;
          responseJson: string | null;
          score: number | null;
          total: number | null;
          mistakes: number | null;
          wordCount: number | null;
          startedAt: string;
          completedAt: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          moduleId: number;
          category: string;
          taskType: string;
          variantId: string;
          topic: string;
          status?: string;
          examSessionId?: string | null;
          orderIndex?: number | null;
          generated?: boolean;
          variantJson?: string | null;
          explanationJson?: string | null;
          speakingStateJson?: string | null;
          responseJson?: string | null;
          score?: number | null;
          total?: number | null;
          mistakes?: number | null;
          wordCount?: number | null;
          startedAt?: string;
          completedAt?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          moduleId?: number;
          category?: string;
          taskType?: string;
          variantId?: string;
          topic?: string;
          status?: string;
          examSessionId?: string | null;
          orderIndex?: number | null;
          generated?: boolean;
          variantJson?: string | null;
          explanationJson?: string | null;
          speakingStateJson?: string | null;
          responseJson?: string | null;
          score?: number | null;
          total?: number | null;
          mistakes?: number | null;
          wordCount?: number | null;
          startedAt?: string;
          completedAt?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "Item": {
        Row: {
          id: string;
          moduleId: number;
          skill: string;
          tierId: number;
          type: string;
          topic: string;
          passageId: string | null;
          passageText: string | null;
          audioUrl: string | null;
          promptText: string;
          optionsJson: string | null;
          answerJson: string;
          explanation: string | null;
          rubricJson: string | null;
          generated: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          moduleId: number;
          skill: string;
          tierId: number;
          type: string;
          topic: string;
          passageId?: string | null;
          passageText?: string | null;
          audioUrl?: string | null;
          promptText: string;
          optionsJson?: string | null;
          answerJson: string;
          explanation?: string | null;
          rubricJson?: string | null;
          generated?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          moduleId?: number;
          skill?: string;
          tierId?: number;
          type?: string;
          topic?: string;
          passageId?: string | null;
          passageText?: string | null;
          audioUrl?: string | null;
          promptText?: string;
          optionsJson?: string | null;
          answerJson?: string;
          explanation?: string | null;
          rubricJson?: string | null;
          generated?: boolean;
          createdAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ItemConstruct": {
        Row: {
          itemId: string;
          constructId: string;
        };
        Insert: {
          itemId: string;
          constructId: string;
        };
        Update: {
          itemId?: string;
          constructId?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "LessonProgress": {
        Row: {
          id: string;
          userId: string;
          lessonSlug: string;
          chapterId: string | null;
          score: number | null;
          total: number | null;
          responsesJson: string | null;
          status: string;
          startedAt: string | null;
          lastVisitedAt: string | null;
          completedAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          lessonSlug: string;
          chapterId?: string | null;
          score?: number | null;
          total?: number | null;
          responsesJson?: string | null;
          status?: string;
          startedAt?: string | null;
          lastVisitedAt?: string | null;
          completedAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          lessonSlug?: string;
          chapterId?: string | null;
          score?: number | null;
          total?: number | null;
          responsesJson?: string | null;
          status?: string;
          startedAt?: string | null;
          lastVisitedAt?: string | null;
          completedAt?: string;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "Module": {
        Row: {
          id: number;
          slug: string;
          name: string;
          cefrGoal: string;
          description: string;
          isFinalExam: boolean;
          isOralOnly: boolean;
          order: number;
        };
        Insert: {
          id: number;
          slug: string;
          name: string;
          cefrGoal: string;
          description: string;
          isFinalExam?: boolean;
          isOralOnly?: boolean;
          order: number;
        };
        Update: {
          id?: number;
          slug?: string;
          name?: string;
          cefrGoal?: string;
          description?: string;
          isFinalExam?: boolean;
          isOralOnly?: boolean;
          order?: number;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ModuleSkillStatus": {
        Row: {
          id: string;
          userId: string;
          moduleId: number;
          skill: string;
          inAppPassed: boolean;
          inAppScore: number | null;
          inAppPassedAt: string | null;
          officialPassed: boolean | null;
          officialSourceId: string | null;
          officialSetAt: string | null;
          discrepancy: boolean;
          discrepancyNote: string | null;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          moduleId: number;
          skill: string;
          inAppPassed?: boolean;
          inAppScore?: number | null;
          inAppPassedAt?: string | null;
          officialPassed?: boolean | null;
          officialSourceId?: string | null;
          officialSetAt?: string | null;
          discrepancy?: boolean;
          discrepancyNote?: string | null;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          moduleId?: number;
          skill?: string;
          inAppPassed?: boolean;
          inAppScore?: number | null;
          inAppPassedAt?: string | null;
          officialPassed?: boolean | null;
          officialSourceId?: string | null;
          officialSetAt?: string | null;
          discrepancy?: boolean;
          discrepancyNote?: string | null;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "OfficialTestResult": {
        Row: {
          id: string;
          userId: string;
          testType: string;
          education: string | null;
          module: number | null;
          result: string | null;
          takenAt: string | null;
          source: string;
          reportCardId: string | null;
          note: string | null;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          testType: string;
          education?: string | null;
          module?: number | null;
          result?: string | null;
          takenAt?: string | null;
          source?: string;
          reportCardId?: string | null;
          note?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          testType?: string;
          education?: string | null;
          module?: number | null;
          result?: string | null;
          takenAt?: string | null;
          source?: string;
          reportCardId?: string | null;
          note?: string | null;
          createdAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ReadingExplanation": {
        Row: {
          id: string;
          textId: string;
          scopeKind: string;
          scopeId: string;
          level: number;
          depth: string;
          json: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          textId: string;
          scopeKind: string;
          scopeId: string;
          level: number;
          depth?: string;
          json: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          textId?: string;
          scopeKind?: string;
          scopeId?: string;
          level?: number;
          depth?: string;
          json?: string;
          createdAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ReadingHighlight": {
        Row: {
          id: string;
          userId: string;
          textId: string;
          sentenceIndex: number;
          color: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          textId: string;
          sentenceIndex: number;
          color?: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          textId?: string;
          sentenceIndex?: number;
          color?: string;
          createdAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ReadingNote": {
        Row: {
          id: string;
          userId: string;
          textId: string;
          anchorKind: string;
          anchorId: string | null;
          quote: string | null;
          body: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          textId: string;
          anchorKind: string;
          anchorId?: string | null;
          quote?: string | null;
          body: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          textId?: string;
          anchorKind?: string;
          anchorId?: string | null;
          quote?: string | null;
          body?: string;
          createdAt?: string;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ReadingProgress": {
        Row: {
          id: string;
          userId: string;
          textId: string;
          status: string;
          bookmarked: boolean;
          mark: string | null;
          readSeconds: number;
          openedAt: string;
          completedAt: string | null;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          textId: string;
          status?: string;
          bookmarked?: boolean;
          mark?: string | null;
          readSeconds?: number;
          openedAt?: string;
          completedAt?: string | null;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          textId?: string;
          status?: string;
          bookmarked?: boolean;
          mark?: string | null;
          readSeconds?: number;
          openedAt?: string;
          completedAt?: string | null;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "ReportCard": {
        Row: {
          id: string;
          userId: string;
          filePath: string;
          mimeType: string;
          uploadedAt: string;
          status: string;
          extractedSprogcenter: string | null;
          extractedModule: number | null;
          extractedDate: string | null;
          extractedResultsJson: string | null;
          extractionConfidence: number | null;
          rawOcrText: string | null;
          confirmedAt: string | null;
          reconciliationJson: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          filePath: string;
          mimeType: string;
          uploadedAt?: string;
          status?: string;
          extractedSprogcenter?: string | null;
          extractedModule?: number | null;
          extractedDate?: string | null;
          extractedResultsJson?: string | null;
          extractionConfidence?: number | null;
          rawOcrText?: string | null;
          confirmedAt?: string | null;
          reconciliationJson?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          filePath?: string;
          mimeType?: string;
          uploadedAt?: string;
          status?: string;
          extractedSprogcenter?: string | null;
          extractedModule?: number | null;
          extractedDate?: string | null;
          extractedResultsJson?: string | null;
          extractionConfidence?: number | null;
          rawOcrText?: string | null;
          confirmedAt?: string | null;
          reconciliationJson?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "SavedWord": {
        Row: {
          id: string;
          userId: string;
          kind: string;
          danish: string;
          lemma: string | null;
          translation: string;
          partOfSpeech: string | null;
          contextSentence: string | null;
          grammarNote: string | null;
          sourceTextId: string | null;
          note: string | null;
          learned: boolean;
          vocabItemId: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          kind?: string;
          danish: string;
          lemma?: string | null;
          translation: string;
          partOfSpeech?: string | null;
          contextSentence?: string | null;
          grammarNote?: string | null;
          sourceTextId?: string | null;
          note?: string | null;
          learned?: boolean;
          vocabItemId?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          kind?: string;
          danish?: string;
          lemma?: string | null;
          translation?: string;
          partOfSpeech?: string | null;
          contextSentence?: string | null;
          grammarNote?: string | null;
          sourceTextId?: string | null;
          note?: string | null;
          learned?: boolean;
          vocabItemId?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "Session": {
        Row: {
          id: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Insert: {
          id?: string;
          sessionToken: string;
          userId: string;
          expires: string;
        };
        Update: {
          id?: string;
          sessionToken?: string;
          userId?: string;
          expires?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "SrsState": {
        Row: {
          id: string;
          userId: string;
          constructId: string;
          easeFactor: number;
          intervalDays: number;
          repetitions: number;
          dueAt: string;
          lastReviewedAt: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          constructId: string;
          easeFactor?: number;
          intervalDays?: number;
          repetitions?: number;
          dueAt?: string;
          lastReviewedAt?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          constructId?: string;
          easeFactor?: number;
          intervalDays?: number;
          repetitions?: number;
          dueAt?: string;
          lastReviewedAt?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "Tier": {
        Row: {
          id: number;
          name: string;
          description: string;
        };
        Insert: {
          id: number;
          name: string;
          description: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "User": {
        Row: {
          id: string;
          email: string;
          passwordHash: string | null;
          name: string | null;
          createdAt: string;
          supabaseUserId: string | null;
          authProvider: string;
        };
        Insert: {
          id?: string;
          email: string;
          passwordHash?: string | null;
          name?: string | null;
          createdAt?: string;
          supabaseUserId?: string | null;
          authProvider?: string;
        };
        Update: {
          id?: string;
          email?: string;
          passwordHash?: string | null;
          name?: string | null;
          createdAt?: string;
          supabaseUserId?: string | null;
          authProvider?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "UserProfile": {
        Row: {
          id: string;
          userId: string;
          education: string | null;
          currentModule: number | null;
          levelSource: string | null;
          levelSetAt: string | null;
          onboardedAt: string | null;
          interestsJson: string | null;
          updatedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          education?: string | null;
          currentModule?: number | null;
          levelSource?: string | null;
          levelSetAt?: string | null;
          onboardedAt?: string | null;
          interestsJson?: string | null;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          education?: string | null;
          currentModule?: number | null;
          levelSource?: string | null;
          levelSetAt?: string | null;
          onboardedAt?: string | null;
          interestsJson?: string | null;
          updatedAt?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "VerificationToken": {
        Row: {
          identifier: string;
          token: string;
          expires: string;
        };
        Insert: {
          identifier: string;
          token: string;
          expires: string;
        };
        Update: {
          identifier?: string;
          token?: string;
          expires?: string;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "VocabItem": {
        Row: {
          id: string;
          moduleId: number;
          topic: string;
          danish: string;
          translation: string;
          exampleSentence: string | null;
        };
        Insert: {
          id?: string;
          moduleId: number;
          topic: string;
          danish: string;
          translation: string;
          exampleSentence?: string | null;
        };
        Update: {
          id?: string;
          moduleId?: number;
          topic?: string;
          danish?: string;
          translation?: string;
          exampleSentence?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
      "VocabSrsState": {
        Row: {
          id: string;
          userId: string;
          vocabId: string;
          easeFactor: number;
          intervalDays: number;
          repetitions: number;
          dueAt: string;
          lastReviewedAt: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          vocabId: string;
          easeFactor?: number;
          intervalDays?: number;
          repetitions?: number;
          dueAt?: string;
          lastReviewedAt?: string | null;
        };
        Update: {
          id?: string;
          userId?: string;
          vocabId?: string;
          easeFactor?: number;
          intervalDays?: number;
          repetitions?: number;
          dueAt?: string;
          lastReviewedAt?: string | null;
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      // Hand-written SQL functions live in supabase/functions.sql. They exist
      // because PostgREST cannot express an upsert whose insert and update
      // differ, nor an atomic increment.
      reading_progress_upsert: {
        Args: {
          p_user_id: string;
          p_text_id: string;
          p_status: string | null;
          p_bookmarked: boolean | null;
          p_mark: string | null;
          p_add_seconds: number | null;
        };
        Returns: Database["public"]["Tables"]["ReadingProgress"]["Row"][];
      };
      saved_word_upsert: {
        Args: {
          p_user_id: string;
          p_kind: string;
          p_danish: string;
          p_lemma: string | null;
          p_translation: string;
          p_part_of_speech: string | null;
          p_context_sentence: string | null;
          p_grammar_note: string | null;
          p_source_text_id: string | null;
          p_note: string | null;
        };
        Returns: Database["public"]["Tables"]["SavedWord"]["Row"][];
      };
      lesson_progress_visit: {
        Args: { p_user_id: string; p_lesson_slug: string; p_chapter_id: string | null };
        Returns: Database["public"]["Tables"]["LessonProgress"]["Row"][];
      };
      module_skill_apply_in_app: {
        Args: {
          p_user_id: string;
          p_module_id: number;
          p_skill: string;
          p_score: number;
          p_passed: boolean;
        };
        Returns: Database["public"]["Tables"]["ModuleSkillStatus"]["Row"][];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience aliases so repositories read cleanly. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
