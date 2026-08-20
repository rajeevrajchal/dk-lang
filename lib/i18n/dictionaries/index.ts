import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { da } from "./da";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { en, da };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
