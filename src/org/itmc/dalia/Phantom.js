/**
 * Dalia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-dalia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-dalia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-dalia/LICENSE MIT License
 */

const extend = require('extend');
const path = require('path');
const spawn = require("child_process").spawn;
const EventEmitter = require('events');

/**
 *
 */
export class Phantom extends EventEmitter {

  /**
   * [constructor description]
   * @method constructor
   * @return {Phantom}    [description]
   */
  constructor() {
    super();
    /** @var {Object} */
    this.logger = null;
  }

  /**
   * Singleton default phantom.js instance.
   * @method getInstance
   * @return {Phantom}
   */
  static getInstance() {
    return new Phantom();
  }

  static defaultOptions = {
    phantomOptions: ["--ssl-protocol=any", "--ignore-ssl-errors=true", "--load-images=false"]
  };

  /**
   * [setLogger description]
   * @param {[type]} logger [description]
   */
  setLogger(logger) {
    this.logger = logger;
  }

  /**
   * [getLogger description]
   * @return {[type]} [description]
   */
  getLogger() {
    return this.logger;
  }

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
              // @see _child.js => var defaultOptions = { ... }
              if (options.hasOwnProperty(key) && ['selector', 'timeout', 'checkInterval', 'detector', 'url'].indexOf(key) > -1) {
                  // args.push('--' + key + '="' + options[key] + '"');
                  args.push('--' + key + '="' + options[key] + '"');
              }
          }

          if (self.getLogger()) {
            self.getLogger().trace('Spawning: ', self.path(), args.join(' '));
          }
          // console.log('Spawning: ', self.path(), args.join(' '));
          var cp = spawn(self.path(), args);
          cp.stdout.on('data', function(data) { content += data.toString(); });
          cp.stderr.on("data", function(err) { reject(err) });
          cp.on("exit", function(code) {
            try {
              resolve(JSON.parse(content.replace(/(\r?\n)*$/, '')));
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) { reject(e); }
    });
  }

}
