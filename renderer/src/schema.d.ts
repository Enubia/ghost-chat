import type { MessageSchema } from '../i18n/schema';

declare module 'vue-i18n' {

    export interface DefineLocaleMessage extends MessageSchema {}
}
