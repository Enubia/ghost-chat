/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue';

    const component: DefineComponent<NonNullable<unknown>, NonNullable<unknown>, any>;
    export default component;
}
