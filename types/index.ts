// The app's shared types.
//
// Every reusable type, interface and alias lives in this directory rather than
// next to the code that happens to use it first, so a shape is defined once and
// imported everywhere. Import from "@/types" for anything shared; the
// per-domain modules are here to keep the directory navigable, not to be
// imported around it.
//
// These modules are type-only: unions derived from an `as const` array import
// that array with `import type`, so the array stays next to the runtime code
// that validates against it and nothing here survives compilation.
//
// The one exception is lib/supabase/database.types.ts, which is generated from
// prisma/schema.prisma by scripts/generate-db-types.ts and so stays where the
// generator writes it. ./database re-exports it.

export type * from "./activity";
export type * from "./adaptive";
export type * from "./ai";
export type * from "./auth";
export type * from "./content-gen";
export type * from "./course";
export type * from "./dashboard";
export type * from "./database";
export type * from "./enums";
export type * from "./exercises";
export type * from "./feedback";
export type * from "./history";
export type * from "./http";
export type * from "./generation";
export type * from "./i18n";
export type * from "./learning";
export type * from "./level";
export type * from "./notes";
export type * from "./progress";
export type * from "./reading";
export type * from "./reports";
export type * from "./repositories";
export type * from "./speaking";
export type * from "./tasks";
export type * from "./translation";
export type * from "./ui";
export type * from "./verbs";
