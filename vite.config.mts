import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

import VueRouter from 'unplugin-vue-router/vite';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n';
import vue from '@vitejs/plugin-vue';
import type { UserConfigFn } from 'vite';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig((({ command }) => {
    rmSync('dist-electron', { recursive: true, force: true });

    const isServe = command === 'serve';
    const isBuild = command === 'build';

    return {
        plugins: [
            VueRouter(),

            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => ['webview'].includes(tag),
                    },
                },
            }),

            VueI18nPlugin.vite({
                include: resolve(__dirname, './i18n/locales/**'),
                runtimeOnly: false,
            }),

            electron([
                {
                    entry: 'electron/main/background.ts',
                    onstart(options) {
                        options.startup();
                    },
                    vite: {
                        resolve: {
                            alias: {
                                '@shared': resolve(__dirname, 'shared'),
                            },
                        },
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
        resolve: {
            alias: {
                '@shared': resolve(__dirname, 'shared'),
                '@components': resolve(__dirname, 'src/components'),
                '@store': resolve(__dirname, 'src/store'),
            },
        },
    };
}) as UserConfigFn);
