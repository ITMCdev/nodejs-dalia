/**
* Sophia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-sophia/)
*
* Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
*
* @link      http://github.com/itmcdev/nodejs-sophia/ for the canonical source repository
* @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
* @license   http://github.com/itmcdev/nodejs-sophia/LICENSE MIT License
*/

import {Logger} from './Logger';
import {Phantom} from './Phantom';

const extend = require('extend');
const path = require('path');
const EventEmitter = require('events');

/**
*
*/
export class Sophia extends EventEmitter {

  static INDEX_URL_MODE_QUEUE = 0x0001;
  static INDEX_URL_MODE_RTREE = 0x0002;

  static defaultOptions = {
    events: {},                         // events
    indexMode: 0x0001, // urls can be indexed by using a lifo queue which should
    // allow a more sync parse, yet slower  or by using a tree recursive
    // algorithm which will be faster yet a possible memory eater.
    ignore: [],                         // urls to ignore during the lifetime of the parsing
    match : null,                       // RegExp => force only urls matching this regexp
    maxDepth: 5,                        // depth of url scan
    selectors: { __default: 'body' },    // selectors for phantom-child
  };

  /**
   * Singleton
   * @return {Sophia} [description]
   */
  static getInstance() {
    return new Sophia();
  }

  /**
  * [constructor description]
  * @method constructor
  * @return {[type]}    [description]
  */
  constructor() {
    super();
    /** @var {Object} */
    this.setLogger(Logger.getInstance());
    /** @var {Phantom} */
    this.setPhantom(Phantom.getInstance());
    this.getPhantom().setLogger(this.getLogger());
  }

  /**
  * Getter for Logger
  * @return {Object}
  */
  getLogger() {
    return this.logger;
  }

  /**
   * Getter for Phantom
   * @return {Phantom}
   */
  getPhantom() {
    return this.phantom;
  }

  /**
   * [indexUrls description]
   * @param  {[type]} url     [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  indexUrls(url, options = {}) {
    options = extend(true, Sophia.defaultOptions, options);
    options.url = url;
    options.detector = path.join(__dirname, '_detector.geturls.js');
    options.found = [url];

    // if we use queue method
    if (options.indexMode === Sophia.INDEX_URL_MODE_QUEUE) {
      // prepare queue
      options.queue = [{ url: url, depth: options.maxDepth }];
      // index urls with queue method
      return this.indexUrlsQueued(options);
    }
    return this.indexUrlsRTree(options);
  }

  /**
   * [indexUrlsQueued description]
   * @param  {Object}  options [description]
   * @return {Promise}         [description]
   */
  indexUrlsQueued(options) {
    let self = this;
    // create a promise to wait for the grabbing process
    return new Promise((resolve, reject) => {
      // recursive function for scanning
      (function _indexUrls(options) {
        self.logger.trace('Queue:', JSON.stringify(options.queue));
        if (options.queue.length) {
          // scanning the first item that was added to the queue
          let cUrl = options.queue.shift();
          if (cUrl.depth >= 0) {
            // call URL
            self.phantomRun(cUrl, options, reject)
              // push the urls to the queue
              .then(data => {
                // also push current url to the ignore set
                options.ignore.push(cUrl.url);
                // queue
                data.forEach(url => {
                  options.queue.push({ url: url, depth: cUrl.depth - 1 });
                  options.found.push(url);
                });
              })
              // continue indexing
              .then(data => _indexUrls(options))
              .catch(err => reject(err));
          } else {
            // self.emit('sophia:queue:depthexceed', cUrl);
            self.logger.warn('Depth Exceeded:', JSON.stringify(cUrl));
            return _indexUrls(options);
          }
        } else {
          resolve(options.found);
        }
      })(options);
    });
  }

  /**
   * [indexUrlsRTree description]
   * @method indexUrlsRTree
   * @param  {Object}  options
   * @return {Promise}
   */
  indexUrlsRTree(options) {
    let self = this;
    return new Promise((resolvex, rejectx) => {
      // recursive function for scanning
      (function _indexUrls(cUrl, options) {
        // create a promise to wait for the grabbing process
        return new Promise((resolve, reject) => {
          // call Url
          self.phantomRun(cUrl, options, reject)
            // construct recursive promises
            .then(data => {
              return data.map(url => {
                options.found.push(url);
                return { url: url, depth: cUrl.depth - 1 };
              }).filter(url => { // and filter by validating depth
                if (url.depth < 0) {
                  self.logger.warn('Depth Exceeded:', JSON.stringify(url));
                  return false;
                }
                return true;
              });
            })
            .catch(err => reject(err))
            // push the urls to the right variables
            .then(data => {
              options.ignore.push(cUrl.url);
              if (data.length != 0) {
                let promises = [];
                data.forEach(cUrl2 => {
                  promises.push(_indexUrls(cUrl2, options));
                });
                Promise.all(promises).then(urlsets => {
                  // console.log(options.found);
                  // console.log(options.found.length);
                  resolve();
                }, function(err) {
                  self.logger.error('Error: ', err);
                });
              } else {
                // console.log(options.found);
                // console.log(options.found.length);
                resolve();
              }
            })
            .catch(err => reject(err));
          });
      })({url: options.url, depth: options.maxDepth}, options)
        .then(() => resolvex(options.found), (err) => rejectx(err));
    });
  }

  /**
   * Run Phantom
   * @param  {Object}   cUrl
   * @param  {Object}   options
   * @param  {Function} reject
   * @return {Promise}
   */
  phantomRun(cUrl, options, reject) {
    this.emit('sophia:phantom', cUrl, options);
    // call URL
    return this.getPhantom()
      .run(cUrl.url, this.phantomOptions(cUrl, options))
      // obtain page content
      .then((data) => {
        this.getLogger().trace('Url', cUrl.url, 'grabbed');
        return data.filter((rec) => {
          // log all data
          let key = null;
          for (key in rec) {
            this.emit('sophia:phantom:' + key, rec[key]);
            if (rec.hasOwnProperty(key) && key !== 'result') {
              this.logger[key]((typeof rec[key] !== 'string') ? JSON.stringify(rec[key]) : rec[key]);
            }
          }
          if (rec.error) { reject(rec.error); } // if rec.error, throw that error

          return rec.result;
        })
      })
      .catch(err => reject(err))
      // obtain the detected urls
      .then(data => {
        return data.pop().result.detected
      })
      .catch(err => reject(err))
      // filter the urls to be valid
      .then(data => {
        return data.filter(url => {
          url = url.replace(/#.*/g, '').replace(/\/$/g, '');
          return this.urlValidate(url, options);
        });
      })
      .catch(err => reject(err))
  }

  /**
   * Customize options for sending to Phantom Thread
   * @param  {Object} options [description]
   * @return {Object}         [description]
   */
  phantomOptions(cUrl, options) {
    // cloning options to setup selector
    let opts = extend(true, {}, options);
    opts.selector = opts.selectors[cUrl.url] || opts.selectors.__default;
    return opts;
  }

  /**
   * [urlValidate description]
   * @param  {String}  url
   * @param  {Object}  options
   * @return {Boolean}
   */
  urlValidate(url, options) {
    return true
      // // must be a http url
      && url.match(/^http(s?):\/\/.+/) !== null
      // // must match filter (RegExp) match
      && (options.match === null || url.match(options.match))
      // must not be in ignore list
      && (!options.ignore || options.ignore.indexOf(url) < 0)
      // must not be in found list already
      && options.found.indexOf(url) < 0
      ;
  }

  /**
   * Setter for Logger
   * @see Logger#getInstance() class
   * @param  {Object} logger This should be an instance of debug-logger or a similar tool.
   */
  setLogger(logger) {
    this.logger = logger;
  }

  /**
   * Setter for Phantom
   * @param {Phantom} phantom
   */
  setPhantom(phantom) {
    this.phantom = phantom;
  }

}
