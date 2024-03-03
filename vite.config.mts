import fs from 'node:fs';
import path from 'node:path';

import VueI18nPlugin from '@intlify/unplugin-vue-i18n';
import vue from '@vitejs/plugin-vue';
import type { UserConfigFn } from 'vite';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import Components from 'unplugin-vue-components/vite';

import tailwind from 'tailwindcss';
import nesting from 'tailwindcss/nesting';
import autoprefixer from 'autoprefixer';

export default defineConfig((({ command }) => {
    fs.rmSync('dist-electron', { recursive: true, force: true });

    const isServe = command === 'serve';
    const isBuild = command === 'build';

    return {
        css: {
            postcss: {
                plugins: [nesting, tailwind, autoprefixer],
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@shared': path.resolve(__dirname, './shared'),
            },
        },
        plugins: [
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => ['webview'].includes(tag),
                    },
                },
            }),

            VueI18nPlugin.vite({
                include: path.resolve(__dirname, './i18n/locales/**'),
                runtimeOnly: false,
            }),

            Components({}),

            electron([
                {
                    entry: 'electron/main/background.ts',
                    onstart(options) {
                        options.startup();
                    },
                    vite: {
                        build: {
                            sourcemap: isServe,
                            minify: isBuild,
                            outDir: 'dist-electron/main',
                        },
                    },
                },
            ]),

            // Use Node.js API in the Renderer-process
            renderer(),
        ],
        clearScreen: false,
    };
}) as UserConfigFn);
