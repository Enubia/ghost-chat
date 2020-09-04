/* eslint-disable @typescript-eslint/no-var-requires */
const { parallel, task } = require('gulp');
const del = require('del');

task('cleanModules', () => {
  return del(['./node_modules']);
});

task('cleandist_electron', () => {
  return del(['./dist_electron']);
});

exports.clean = parallel('cleanModules', 'cleandist_electron');
