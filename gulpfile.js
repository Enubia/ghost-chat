/* eslint-disable @typescript-eslint/no-var-requires */
const { parallel, task } = require('gulp');
const del = require('del');

task('cleanDist', () => {
  return del(['./dist_electron']);
});

task('cleanModules', () => {
  return del(['./node_modules']);
});

exports.clean = parallel('cleanDist', 'cleanModules');
