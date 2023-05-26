import CN from "./cn";
import EN from "./en";
/* import TW from "./tw";
import ES from "./es";
import IT from "./it";
import TR from "./tr";
import JP from "./jp";
import DE from "./de"; */

export type { LocaleType } from "./cn";

export const AllLangs = [
  "en",
  "cn",
/*   "tw",
  "es",
  "it",
  "tr",
  "jp",
  "de", */
] as const;
export type Lang = (typeof AllLangs)[number];

export const AllReadLangs = [
  "en",
  "cn",
  "es",
  "de",
  "jp",
/*   "tw",
  
  "it",
  "tr",
  "jp",
   */
] as const;
export type ReadLang = (typeof AllReadLangs)[number];

const LANG_KEY = "lang";
const Read_LANG_KEY = "Readlang";

function getItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch(error) {
    console.error(`Error retrieving item '${key}' from localStorage:`, error);
    
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function getLanguage() {
  try {
    return navigator.language.toLowerCase();
  } catch {
    return "cn";
  }
}

export function getLang(): Lang {
  const savedLang = getItem(LANG_KEY);

  if (AllLangs.includes((savedLang ?? "") as Lang)) {
    return savedLang as Lang;
  }

  const lang = getLanguage();

  for (const option of AllLangs) {
    if (lang.includes(option)) {
      return option;
    }
  }

  return "en";
}

export function getReadLang(): ReadLang {
  const savedLang = getItem(Read_LANG_KEY);

  if (savedLang === null){
    return "en"
  }

  if (AllReadLangs.includes((savedLang ?? "") as ReadLang)) {
    return savedLang as ReadLang;
  }

  const lang = getReadLang();

  for (const option of AllReadLangs) {
    if (lang.includes(option)) {
      return option;
    }
  }

  return "en";
}


export function changeLang(lang: Lang) {
  setItem(LANG_KEY, lang);
  location.reload();
}
export function changeReadLang(lang: ReadLang) {
  setItem(Read_LANG_KEY, lang);
  //location.reload();
}

export default {
  en: EN,
  cn: CN,
/*   tw: TW,
  es: ES,
  it: IT,
  tr: TR,
  jp: JP,
  de: DE, */
}[getLang()] as typeof CN;
