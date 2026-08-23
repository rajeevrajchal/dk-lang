/**
 * Generates the Supabase `Database` type from prisma/schema.prisma.
 *
 *     npx tsx scripts/generate-db-types.ts
 *
 * Normally you would run `supabase gen types typescript`, but that needs a
 * live database. The Prisma schema is the same information and is already the
 * authority for what the tables look like, so it is read directly — which also
 * means the types cannot drift from the migration that created the tables.
 *
 * Prisma keeps owning the schema and migrations. It no longer runs queries;
 * that is what lib/repositories now does through supabase-js.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SCALARS: Record<string, string> = {
  String: "string",
  Int: "number",
  Float: "number",
  Boolean: "boolean",
  // Postgres timestamps arrive over PostgREST as ISO strings, not Dates.
  DateTime: "string",
  Json: "Json",
  BigInt: "number",
  Decimal: "number",
};

interface Field {
  name: string;
  tsType: string;
  nullable: boolean;
  /** Has a default or is generated, so it may be omitted on insert. */
  optionalOnInsert: boolean;
}

function parseModels(schema: string): Map<string, Field[]> {
  const models = new Map<string, Field[]>();

  for (const match of schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)) {
    const [, name, body] = match;
    const fields: Field[] = [];

    for (const rawLine of body.split("\n")) {
      const line = rawLine.replace(/\/\/.*$/, "").trim();
      if (!line || line.startsWith("@@")) continue;

      const m = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?\s*(.*)$/);
      if (!m) continue;
      const [, fieldName, type, isList, isOptional, attrs] = m;

      // Relation fields are objects on the Prisma side and simply absent from
      // the row; the foreign key column next to them is what actually exists.
      if (attrs.includes("@relation") || isList) continue;

      const scalar = SCALARS[type];
      if (!scalar) continue; // enum or unknown — none in this schema today

      fields.push({
        name: fieldName,
        tsType: scalar,
        nullable: !!isOptional,
        optionalOnInsert:
          !!isOptional || attrs.includes("@default") || attrs.includes("@updatedAt"),
      });
    }

    models.set(name, fields);
  }

  return models;
}

function renderRow(fields: Field[], mode: "Row" | "Insert" | "Update"): string {
  return fields
    .map((f) => {
      const optional = mode === "Update" || (mode === "Insert" && f.optionalOnInsert);
      const nullable = f.nullable ? " | null" : "";
      return `          ${f.name}${optional ? "?" : ""}: ${f.tsType}${nullable};`;
    })
    .join("\n");
}

function main() {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  const models = parseModels(schema);

  const tables = [...models.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([name, fields]) => `      ${JSON.stringify(name)}: {
        Row: {
${renderRow(fields, "Row")}
        };
        Insert: {
${renderRow(fields, "Insert")}
        };
        Update: {
${renderRow(fields, "Update")}
        };
        // supabase-js requires this key on every table. Left empty: the
        // repositories never ask PostgREST to embed a related table, because
        // the relations that matter here are resolved in application code.
        Relationships: [];
      };`
    )
    .join("\n");

  const out = `// GENERATED FILE — do not edit.
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
${tables}
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
`;

  writeFileSync("lib/supabase/database.types.ts", out);
  console.log(`${models.size} tables -> lib/supabase/database.types.ts`);
}

main();
