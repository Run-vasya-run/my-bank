import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  ru: {
    translation: {
      welcome: 'Добро пожаловать в Belly Bank', // ПОМЕНЯЛИ ТУТ
      login_title: 'Вход в Суперприложение',
      phone_label: 'Номер телефона',
      password_label: 'Пароль',
      login_button: 'Войти',
      home: 'Главная',
      services: 'Сервисы',
    },
  },
  en: {
    translation: {
      welcome: 'Welcome to Belly Bank', // ПОМЕНЯЛИ ТУТ
      login_title: 'SuperApp Login',
      phone_label: 'Phone Number',
      password_label: 'Password',
      login_button: 'Login',
      home: 'Home',
      services: 'Services',
    },
  },
  kz: {
    translation: {
      welcome: 'Belly Bank-ке қош келдіңіз', // ПОМЕНЯЛИ ТУТ
      login_title: 'Суперқосымшаға кіру',
      phone_label: 'Телефон нөмірі',
      password_label: 'Құпия сөз',
      login_button: 'Кіру',
      home: 'Басты бет',
      services: 'Қызметтер',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode || 'ru', 
    fallbackLng: 'ru', 
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;