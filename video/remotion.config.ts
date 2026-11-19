import { Config } from '@remotion/cli/config';
import path from 'node:path';

const root = process.cwd();
const frontend = path.join(root, '../frontend');

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((config) => ({
    ...config,
    output: {
        ...config.output,
        assetModuleFilename: 'static/[contenthash][ext]',
    },
    resolve: {
        ...config.resolve,
        modules: [path.join(root, 'node_modules'), 'node_modules'],
        extensionAlias: {
            '.js': ['.ts', '.tsx', '.js'],
        },
        alias: {
            ...config.resolve?.alias,
            '@bindings/ghost-chat/app.js': path.join(root, 'src/mocks/app.ts'),
            '@bindings': path.join(frontend, 'bindings'),
            '@wailsio/runtime': path.join(root, 'src/mocks/runtime.ts'),
            'wails-create': path.join(frontend, 'node_modules/@wailsio/runtime/dist/create.js'),
            '@': path.join(frontend, 'src'),
        },
    },
}));
