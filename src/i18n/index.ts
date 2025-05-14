import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/translation.yaml';
import es from './es/translation.yaml';
import fr from './fr/translation.yaml';
import ja from './ja/translation.yaml';
import ko from './ko/translation.yaml';
import zhCN from './zh-CN/translation.yaml';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  ja: { translation: ja },
  ko: { translation: ko },
  'zh-CN': { translation: zhCN },
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
