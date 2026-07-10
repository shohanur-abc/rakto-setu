import bn from "./bn.ts";
import en from "./en.ts";

const t = { en, bn };

export type Locale = keyof typeof t;
export type T = (typeof t)[Locale];

export const defaultLocale: Locale = "en";

export const isLocale = (lang: string): lang is Locale => {
    return lang in t;
};

export const getTranslation = (lang: string): T => {
    return isLocale(lang) ? t[lang] : t[defaultLocale];
};
