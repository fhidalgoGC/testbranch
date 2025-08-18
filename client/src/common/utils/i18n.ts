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
  // Force Spanish as default instead of browser detection
  return 'es';
};

const initialLanguage = getSavedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Use saved/detected language
    fallbackLng: 'es',
    debug: false,
    keySeparator: '.', // Enable nested key resolution
    nsSeparator: false, // Disable namespace separator
    interpolation: {
      escapeValue: false,
    },
    // Enable partial returns to prevent key returns
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
