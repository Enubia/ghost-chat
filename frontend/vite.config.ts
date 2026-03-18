import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@bindings': path.resolve(__dirname, 'bindings'),
        },
    },
});
