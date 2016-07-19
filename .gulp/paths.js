var appRoot = 'src/';
var outputRoot = 'dist/';

module.exports = {
  root: appRoot,

  es6: appRoot + '**/*.es6',
  coffee: appRoot + '**/*.coffee',
  js: appRoot + '**/*.js',
  ts: appRoot + '**/*.ts',

  output: outputRoot
};
