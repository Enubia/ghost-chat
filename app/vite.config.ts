import VueI18nPlugin from '@intlify/unplugin-vue-i18n';
import iconify from '@tomjs/vite-plugin-iconify';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
import VueRouter from 'unplugin-vue-router/vite';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig(({ command }) => {
    rmSync('out', { recursive: true, force: true });

    const isServe = command === 'serve';
    const isBuild = command === 'build';

    return {
        build: {
            outDir: 'out/dist',
        },
        css: {
            postcss: {
                plugins: [tailwind(), autoprefixer()],
            },
        },
        plugins: [
            VueRouter({
                routesFolder: './renderer/pages',
            }),

            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: (tag) => ['webview'].includes(tag),
                    },
                },
            }),

            iconify({
                resources: ['https://unpkg.com/@iconify/json/json'],
                rotate: 3000,
                local: ['fa6-brands', 'fa6-solid', 'fa6-regular', 'svg-spinners', 'mdi'],
            }),

            VueI18nPlugin.vite({
                include: resolve(process.cwd(), './renderer/i18n/locales/**'),
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
                                '#ipc': resolve(process.cwd(), 'ipc'),
                            },
                        },
                        build: {
                            sourcemap: isServe,
                            minify: isBuild,
                            outDir: 'out/dist-electron/main',
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
                '#ipc': resolve(process.cwd(), 'ipc'),
                '#constants': resolve(process.cwd(), 'renderer/constants'),
                '#components': resolve(process.cwd(), 'renderer/components'),
                '#lib': resolve(process.cwd(), 'renderer/lib'),
                '#layouts': resolve(process.cwd(), 'renderer/layouts'),
                '#store': resolve(process.cwd(), 'renderer/store'),
            },
        },
    };
});
