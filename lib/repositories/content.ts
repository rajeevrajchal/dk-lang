import "server-only";

import { db, unwrap } from "@/lib/supabase/db";
import type { Tables } from "@/lib/supabase/database.types";

// Curriculum content: modules, tiers, constructs and the item bank.
//
// Shared by every learner and owned by nobody, so RLS allows any signed-in
// user to read it and nothing to write it (see supabase/rls.sql §5).
//
// Relations are joined in application code rather than with PostgREST embeds.
// Embeds depend on foreign-key naming and produce nested shapes that are
// awkward to type; more importantly the whole content bank is a few dozen
// rows, so fetching the pieces and joining them costs nothing measurable and
// is much easier to reason about than an embed string.

export type ItemRow = Tables<"Item">;
export type ConstructRow = Tables<"Construct">;

export interface ItemWithConstructs extends ItemRow {
  itemConstructs: { constructId: string; construct: ConstructRow }[];
}

/** Attaches each item's constructs, with two extra queries for the whole set. */
async function withConstructs(items: ItemRow[]): Promise<ItemWithConstructs[]> {
  if (items.length === 0) return [];
  const supabase = await db();

  const links = unwrap(
    await supabase
      .from("ItemConstruct")
      .select("itemId, constructId")
      .in("itemId", items.map((i) => i.id)),
    "withConstructs(links)"
  );

  const constructIds = [...new Set(links.map((l) => l.constructId))];
  const constructs = constructIds.length
    ? unwrap(
        await supabase.from("Construct").select("*").in("id", constructIds),
        "withConstructs(constructs)"
      )
    : [];

  const constructById = new Map(constructs.map((c) => [c.id, c]));
  const byItem = new Map<string, { constructId: string; construct: ConstructRow }[]>();

  for (const link of links) {
    const construct = constructById.get(link.constructId);
    if (!construct) continue;
    const list = byItem.get(link.itemId) ?? [];
    list.push({ constructId: link.constructId, construct });
    byItem.set(link.itemId, list);
  }

  return items.map((item) => ({ ...item, itemConstructs: byItem.get(item.id) ?? [] }));
}

export interface ConstructWithAccuracy extends ConstructRow {
  constructAccura: Tables<"ConstructAccuracy">[];
}

/**
 * Constructs, optionally limited to those exercised by a module's items, each
 * carrying this learner's accuracy for one skill.
 */
export async function constructsWithAccuracy(
  userId: string,
  skill: string,
  moduleId?: number
): Promise<ConstructWithAccuracy[]> {
  const supabase = await db();

  let constructs = unwrap(
    await supabase.from("Construct").select("*").order("tierId", { ascending: true }),
    "constructsWithAccuracy"
  );

  if (moduleId) {
    // "Constructs exercised by an item in this module" — expressed as two
    // lookups rather than a nested filter.
    const moduleItems = unwrap(
      await supabase.from("Item").select("id").eq("moduleId", moduleId),
      "constructsWithAccuracy(items)"
    );
    if (moduleItems.length === 0) return [];

    const links = unwrap(
      await supabase
        .from("ItemConstruct")
        .select("constructId")
        .in("itemId", moduleItems.map((i) => i.id)),
      "constructsWithAccuracy(links)"
    );
    const allowed = new Set(links.map((l) => l.constructId));
    constructs = constructs.filter((c) => allowed.has(c.id));
  }

  if (constructs.length === 0) return [];

  const accuracy = unwrap(
    await supabase
      .from("ConstructAccuracy")
      .select("*")
      .eq("userId", userId)
      .eq("skill", skill)
      .in("constructId", constructs.map((c) => c.id)),
    "constructsWithAccuracy(accuracy)"
  );

  const byConstruct = new Map<string, Tables<"ConstructAccuracy">[]>();
  for (const a of accuracy) {
    const list = byConstruct.get(a.constructId) ?? [];
    list.push(a);
    byConstruct.set(a.constructId, list);
  }

  return constructs.map((c) => ({ ...c, constructAccura: byConstruct.get(c.id) ?? [] }));
}

/** Item ids this learner has answered recently, so they are not served again. */
export async function recentlyAnsweredItemIds(
  userId: string,
  moduleId: number,
  skill: string,
  take = 30
): Promise<string[]> {
  const supabase = await db();

  const moduleItems = unwrap(
    await supabase.from("Item").select("id").eq("moduleId", moduleId).eq("skill", skill),
    "recentlyAnsweredItemIds(items)"
  );
  if (moduleItems.length === 0) return [];

  const attempts = unwrap(
    await supabase
      .from("Attempt")
      .select("itemId")
      .eq("userId", userId)
      .in("itemId", moduleItems.map((i) => i.id))
      .order("createdAt", { ascending: false })
      .limit(take),
    "recentlyAnsweredItemIds"
  );
  return attempts.map((a) => a.itemId);
}

export async function itemsAtTier(
  moduleId: number,
  skill: string,
  tierId: number,
  excludeIds: string[],
  take: number
): Promise<ItemWithConstructs[]> {
  const supabase = await db();
  let query = supabase
    .from("Item")
    .select("*")
    .eq("moduleId", moduleId)
    .eq("skill", skill)
    .eq("tierId", tierId)
    .limit(take);

  // PostgREST expects a bracketed list for `not.in`, and an empty one is a
  // syntax error — so the filter is only added when there is something to
  // exclude.
  if (excludeIds.length > 0) query = query.not("id", "in", `(${excludeIds.join(",")})`);

  return withConstructs(unwrap(await query, "itemsAtTier"));
}

/** Items below a tier that exercise one of the given constructs, for review. */
export async function reviewItems(
  moduleId: number,
  skill: string,
  belowTier: number,
  constructIds: string[],
  take: number
): Promise<ItemWithConstructs[]> {
  if (constructIds.length === 0) return [];
  const supabase = await db();

  const links = unwrap(
    await supabase.from("ItemConstruct").select("itemId").in("constructId", constructIds),
    "reviewItems(links)"
  );
  if (links.length === 0) return [];

  const items = unwrap(
    await supabase
      .from("Item")
      .select("*")
      .eq("moduleId", moduleId)
      .eq("skill", skill)
      .lt("tierId", belowTier)
      .in("id", [...new Set(links.map((l) => l.itemId))])
      .limit(take),
    "reviewItems"
  );
  return withConstructs(items);
}

export async function itemsForModuleSkill(
  moduleId: number,
  skill: string,
  take: number
): Promise<ItemWithConstructs[]> {
  const supabase = await db();
  const items = unwrap(
    await supabase
      .from("Item")
      .select("*")
      .eq("moduleId", moduleId)
      .eq("skill", skill)
      .limit(take),
    "itemsForModuleSkill"
  );
  return withConstructs(items);
}

export async function findItem(itemId: string): Promise<ItemWithConstructs | null> {
  const supabase = await db();
  const items = unwrap(
    await supabase.from("Item").select("*").eq("id", itemId),
    "findItem"
  );
  if (items.length === 0) return null;
  return (await withConstructs(items))[0];
}

/**
 * The pool the timed exam draws from at one tier.
 *
 * MATCHING items are excluded because the exam page renders only MC, TF and
 * gap-fill; they still appear in adaptive practice.
 */
export async function examPoolAtTier(
  moduleId: number,
  skill: string,
  tierId: number
): Promise<ItemRow[]> {
  const supabase = await db();
  return unwrap(
    await supabase
      .from("Item")
      .select("*")
      .eq("moduleId", moduleId)
      .eq("skill", skill)
      .eq("tierId", tierId)
      .neq("type", "MATCHING"),
    "examPoolAtTier"
  );
}
