/* eslint-disable @typescript-eslint/no-var-requires */
const { parallel, task } = require('gulp');
const del = require('del');

task('cleanDist', () => del('dist_electron', { force: true, dot: true }));

task('cleanModules', () => del('node_modules', { force: true, dot: true }));

exports.clean = parallel('cleanDist', 'cleanModules');
