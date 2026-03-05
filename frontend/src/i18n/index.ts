import i18n from 'i18next';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

// oxlint-disable-next-line import/no-named-as-default-member
void i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en-US',
        interpolation: {
            escapeValue: false,
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
    });

export default i18n;
