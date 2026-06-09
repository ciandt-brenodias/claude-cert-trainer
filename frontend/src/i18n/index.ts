import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ptBR from './pt-BR.json';

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('lang') ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: {
    en: { translation: en },
    'pt-BR': { translation: ptBR },
  },
});

export default i18n;
