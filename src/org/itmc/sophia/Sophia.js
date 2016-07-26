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
const uuid = require('uuid');

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
    ignoreHash: false,
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
    /** @var {Object} */
    this.found = {};
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
    // options.found = [url];


    options.session = uuid.v4();
    this.found[options.session] = [url];

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
      // recursive function for scanning
    return (function _indexUrls(options) {
      self.logger.trace('Queue:', JSON.stringify(options.queue), options.queue.length, 'to go');
      if (options.queue.length > 0) {
        // scanning the first item that was added to the queue
        let cUrl = options.queue.shift();
        self.logger.trace('Url: ', JSON.stringify(cUrl));
        if (cUrl.depth >= 0) {
          // call URL
          return self.phantomRun(cUrl, options)
            // push the urls to the queue
            .then(data => {
              // also push current url to the ignore set
              options.ignore.push(cUrl.url);
              // queue
              data.forEach(url => {
                options.queue.push({ url: url, depth: cUrl.depth - 1 });
                // options.found.push(url);
                self.found[options.session].push(url);
              });
            })
            .catch(err => Promise.reject(err))
            // continue indexing
            .then(data => _indexUrls(options))
            .catch(err => Promise.reject(err));
        } else {
          // self.emit('sophia:queue:depthexceed', cUrl);
          self.logger.warn('Depth Exceeded:', JSON.stringify(cUrl));
          return _indexUrls(options);
        }
      } else {
        // resolve([...new Set(options.found)]);
        return Promise.resolve(options.session);
      }
    })(options);
  }

  /**
   * [indexUrlsRTree description]
   * @method indexUrlsRTree
   * @param  {Object}  options
   * @return {Promise}
   */
  indexUrlsRTree(options) {
    let self = this;
    // recursive function for scanning
    return (function _indexUrls(cUrl, options) {
      self.logger.trace('Url: ', JSON.stringify(cUrl));
      // call Url
      return self.phantomRun(cUrl, options)
        // construct recursive promises
        .then(data => data
          // build url/deph structure
          .map(url => {
            // options.found.push(url);this.found[options.session]
            self.found[options.session].push(url);
            return { url: url, depth: cUrl.depth - 1 };
          })
          // filter the structures having negative depth
          .filter(url => {
            if (url.depth < 0) {
              self.logger.warn('Depth Exceeded:', JSON.stringify(url));
              return false;
            }
            return true;
          })
        )
        .catch(err => Promise.reject(err))
        // launch new (paralel) promises for the found urls
        .then(data => {
          // ignore current url
          options.ignore.push(cUrl.url);
          if (data.length != 0) {
            let promises = [];
            // create promises
            data.forEach(cUrl2 => promises.push(_indexUrls(cUrl2, options)));
            // wait for promises
            return Promise.all(promises).then(urlsets => {}, (err) => self.logger.error('Error: ', err));
          } else {
            return Promise.resolve();
          }
        })
        .catch(err => Promise.reject(err));
    })({url: options.url, depth: options.maxDepth}, options)
      .then(() => options.session, (err) => self.logger.error('Error: ', err));
  }

  /**
   * [phantomParseResult description]
   * @param  {Array}    data   [description]
   * @param  {Object}   cUrl   [description]
   * @return {Array}
   */
  phantomParseResult(data, cUrl) {
    this.getLogger().trace('Url', cUrl.url, 'grabbed');
    let fdata =  data.filter((rec) => {
      // log all data
      let key = null;
      for (key in rec) {
        this.emit('sophia:phantom:run-' + key, rec[key]);
        if (rec.hasOwnProperty(key) && key !== 'result') {
          this.logger[key]((typeof rec[key] !== 'string') ? JSON.stringify(rec[key]) : rec[key]);
        }
      }
      // if (rec.error) { reject(rec.error); } // if rec.error, throw that error

      return rec.result;
    });
    if (!fdata.length) {
      fdata = [{result:{detected: []}}];
    }
    return fdata;
  };

  /**
   * Run Phantom
   * @param  {Object}   cUrl
   * @param  {Object}   options
   * @return {Promise}
   */
  phantomRun(cUrl, options) {
    this.emit('sophia:phantom', cUrl, options);
    // call URL
    return this.getPhantom()
      .run(cUrl.url, this.phantomOptions(cUrl, options))
      // obtain page content
      .then(data => this.phantomParseResult(data, cUrl))
      .catch(err => Promise.reject(err))
      // obtain the detected urls
      .then(data => {
        var result = data.pop().result;
        this.emit('sophia:phantom:result-discovered', result);
        return result.detected;
      })
      .catch(err => Promise.reject(err))
      // clean url form
      .then(data => data.map((url) => {
        var ourl = { url: url };
        this.emit('sophia:pre:urlValidate', ourl);
        return ourl.url;
      }))
      .catch(err => Promise.reject(err))
      // filter the urls to be valid
      .then(data => {
        return data.filter(url => {
          url = this.urlValidate(url, cUrl, options);
          let ourl = { url: url };
          this.emit('sophia:post:urlValidate', ourl);
          return ourl.url;
        });
      })
      .catch(err => Promise.reject(err))
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
  urlValidate(url, cUrl, options) {
    return true
      // compare with itself
      && cUrl.url !== url
      // must be a http url
      && url.match(/^http(s?):\/\/.+/) !== null
      // must match filter (RegExp) match
      && (options.match === null || url.match(options.match))
      // must not be in ignore list
      && (!options.ignore || options.ignore.indexOf(url) < 0)
      // must not be in found list already
      // && options.found.indexOf(url) < 0
      && this.found[options.session].indexOf(url) < 0
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
