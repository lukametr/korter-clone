import { ka } from './ka';
import { en } from './en';

export const translations = {
  ka,
  en
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof ka;
