// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Імпортуємо файли з перекладами
import translationEN from './locales/en.json';
import translationUK from './locales/uk.json';

i18n
  // Підключаємо плагін для визначення мови
  .use(LanguageDetector)
  // Підключаємо react-i18next
  .use(initReactI18next)
  // Ініціалізуємо i18next
  .init({
    debug: true, // Вмикає логування в консоль, корисно при розробці
    fallbackLng: 'en', // Мова за замовчуванням, якщо інша не знайдена
    interpolation: {
      escapeValue: false, // React вже захищає від XSS
    },
    resources: {
      en: {
        translation: translationEN
      },
      uk: {
        translation: translationUK
      }
    },
    // Опції для LanguageDetector
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
    }
  });

export default i18n;