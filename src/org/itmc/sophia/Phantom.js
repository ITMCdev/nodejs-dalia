/**
 * Sophia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-sophia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-sophia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-sophia/LICENSE MIT License
 */

var extend = require('extend');
var path = require('path');
var spawn = require("child_process").spawn;

/**
 *
 */
export class Phantom {

  /**
   * Singleton default phantom.js instance.
   * @method getInstance
   * @return {Phantom}
   */
  static getInstance() {
    return new Phantom();
  }

  static defaultOptions = {
    phantomOptions: ["--ssl-protocol=any", "--ignore-ssl-errors=true"]
  };

  /**
   * Obtain phantom.js' executable path.
   * @method path
   * @return {String}
   */
  path() {
      var phantomSource = require("phantomjs-prebuilt").path;
      if (path.extname(phantomSource).toLowerCase() === ".cmd") {
          return path.join(path.dirname( phantomSource ), "//node_modules//phantomjs-prebuilt//lib//phantom//bin//phantomjs.exe");
      }
      return phantomSource;
  }

  /**
   * Run phantom.js script
   * @method run
   * @param  {String}  url
   * @param  {Object}  options
   * @return {Promise}
   */
  run(url, options) {
    let self = this;
    options = extend(true, Phantom.defaultOptions, options);
    options.url = url;
    return new Promise(function(resolve, reject){
        var content = '';
        var args = [];
        var key = '';

        try {
          options.phantomOptions.forEach(function(v) { args.push(v); })
          args.push(path.join(__dirname, '_child.js'));
          for (key in options) {
              if (options.hasOwnProperty(key) && key != 'phantomOptions') {
                  args.push('--' + key + '=' + options[key]);
              }
          }

          var cp = spawn(self.path(), args);
          cp.stdout.on('data', function(data) { content += data.toString(); });
          cp.stderr.on("data", function(e) { reject(e) });
          cp.on("exit", function(code) { resolve(content.replace(/(\r?\n)*$/, '')); });
        } catch (e) { reject(e); }
    });
  }

}
