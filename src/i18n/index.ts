import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.yaml';
import fr from './fr/translation.yaml';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

i18n.use(initReactI18next).init({
  resources,
  lng: navigator.language,
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
