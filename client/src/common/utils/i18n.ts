import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../../locales/en.json';
import esTranslations from '../../locales/es.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

// Get saved language or detect browser language
const getSavedLanguage = () => {
  const savedLang = localStorage.getItem('language');
  if (savedLang && ['en', 'es'].includes(savedLang)) {
    return savedLang;
  }
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'es'].includes(browserLang) ? browserLang : 'es';
};

const initialLanguage = getSavedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

// Save initial language to localStorage
localStorage.setItem('language', initialLanguage);

export default i18n;
