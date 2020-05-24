/**
 * The file enables `@/store/index.js` to import all vuex modules
 * in a one-shot manner. There should not be any reason to edit this file.
 */

// @ts-ignore
const files = require.context('.', false, /\.ts$/);
const modules = {};

files.keys().forEach((key) => {
  if (key === './index.ts') return;
  const moduleName = key.replace(/(\.\/|\.ts)/g, '');
  modules[moduleName] = files(key).default;
});

export default modules;
