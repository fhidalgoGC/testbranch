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

// Detect browser language
const detectLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'es'].includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save detected language to localStorage
localStorage.setItem('currentLanguage', i18n.language);

export default i18n;
