import { create } from 'zustand';
import i18n from '../i18n/index';

type Lang = 'en' | 'pt-BR';

interface LanguageState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguage = create<LanguageState>((set) => ({
  lang: (localStorage.getItem('lang') ?? 'en') as Lang,
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
    set({ lang });
  },
}));
