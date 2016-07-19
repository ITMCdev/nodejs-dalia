var gulp = require('gulp');
var paths = require('../paths');
// var browserSync = require('browser-sync');

// outputs changes to files to the console
function reportChange(event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch', function() {
  gulp.watch([paths.es6, paths.js], ['build-es6']).on('change', reportChange);
});
