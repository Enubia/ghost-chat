import { DefineLocaleMessage } from 'vue-i18n';

import { MessageSchema } from '../i18n/schema';

declare module 'vue-i18n' {

    // define the locale messages schema
    export interface DefineLocaleMessage extends MessageSchema {}
}
