import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import cs from './locales/cs.json';
import ca from './locales/ca.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    es: { translation: es },
    cs: { translation: cs },
    ca: { translation: ca },
    fr: { translation: fr },
    de: { translation: de },
    it: { translation: it },
    pt: { translation: pt },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
