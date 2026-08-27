import { en } from "./en";
import { da } from "./da";
import type { Dictionary, Locale } from "@/types";

const dictionaries: Record<Locale, Dictionary> = { en, da };

export const getDictionary = (locale: Locale): Dictionary => {
  return dictionaries[locale];
};
