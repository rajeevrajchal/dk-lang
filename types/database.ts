// Database row types.
//
// `lib/supabase/database.types.ts` is generated from prisma/schema.prisma by
// scripts/generate-db-types.ts, so it stays where the generator writes it.
// Everything else reaches the schema through this module.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type { Database, Inserts, Json, Tables, Updates } from "@/lib/supabase/database.types";

/** A Supabase client already bound to this app's schema. */
export type Db = SupabaseClient<Database>;

/** The database functions declared in supabase/functions.sql. */
export type DatabaseFunctions = Database["public"]["Functions"];
