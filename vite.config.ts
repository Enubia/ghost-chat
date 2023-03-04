import { rmSync } from 'node:fs';

import vue from '@vitejs/plugin-vue';
import { defineConfig, UserConfigFn } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig((({ command }) => {
	rmSync('dist-electron', { recursive: true, force: true });

	const isServe = command === 'serve';
	const isBuild = command === 'build';
	const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

	return {
		plugins: [
			vue({
				template: {
					compilerOptions: {
						isCustomElement: (tag) => ['webview'].includes(tag),
					},
				},
			}),
			electron([
				{
					// Main-Process entry file of the Electron App.
					entry: 'electron/main/background.ts',
					onstart(options) {
						if (process.env.VSCODE_DEBUG) {
							console.log(/* For `.vscode/.debug.script.mjs` */ '[startup] Electron App');
						} else {
							options.startup();
						}
					},
					vite: {
						build: {
							sourcemap,
							minify: isBuild,
							outDir: 'dist-electron/main',
							rollupOptions: {
								external: Object.keys(
									'dependencies' in pkg ? pkg.dependencies : ({} as unknown as any),
								),
							},
						},
					},
				},
			]),
			// Use Node.js API in the Renderer-process
			renderer({
				nodeIntegration: true,
			}),
		],
		server:
			process.env.VSCODE_DEBUG &&
			(() => {
				const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
				return {
					host: url.hostname,
					port: +url.port,
				};
			})(),
		clearScreen: false,
	};
}) as UserConfigFn);
