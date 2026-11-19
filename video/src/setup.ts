import { loadFont as loadMono } from '@remotion/google-fonts/IBMPlexMono';
import { loadFont as loadSans } from '@remotion/google-fonts/IBMPlexSans';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translation from '../../frontend/public/locales/en-US/translation.json';

import '@/index.css';

export const fonts = {
    sans: loadSans('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin'] }).fontFamily,
    mono: loadMono('normal', { weights: ['400', '500'], subsets: ['latin'] }).fontFamily,
};

void i18n.use(initReactI18next).init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    interpolation: { escapeValue: false },
    resources: { 'en-US': { translation } },
});
