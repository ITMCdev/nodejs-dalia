var gulp = require('gulp');
var babel = require('gulp-babel');
var babelOptions = require('../babel-options');
var changed = require('gulp-changed');
var notify = require('gulp-notify');
var paths = require('../paths');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');

gulp.task('build-es6', function() {
      return gulp.src([paths.es6, paths.js])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        // .pipe(babel({ presets: ['es2015'] }))
        // .pipe(babel(babelOptions.commonjs()))
        .pipe(babel(babelOptions.nodejs()))
        .pipe(changed(paths.output, {extension: '.js'}))
        .pipe(gulp.dest(paths.output));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    [
      'build-es6',
      // 'pre-build-less'
    ],
    callback
  );
});
