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
  static INDEX_URL_MODE_QTREE = 0x0003;

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

    switch (options.indexMode) {
      case Sophia.INDEX_URL_MODE_QTREE:
        return this.indexUrlsQTree(options);
      case Sophia.INDEX_URL_MODE_RTREE:
        return this.indexUrlsRTree(options);
      default:
        return this.indexUrlsQueued(options);
    }
  }

  /**
   * [indexUrlsQueued description]
   * @param  {Object}  options [description]
   * @return {Promise}         [description]
   */
  indexUrlsQueued(options) {
    let self = this;
    // prepare queue
    options.queue = [{ url: options.url, depth: options.maxDepth }];

    // Define a recursive function for scanning each url that is pushed in the
    // queue.
    return (function _indexUrls(options) {
      // log
      self.logger.trace('Queue:', JSON.stringify(options.queue), options.queue.length, 'to go');
      // If the queue is not empty, obtain the first element from the queue (it's a LIFO queue)
      // and start scanning its content (but only if the depth is good).
      if (options.queue.length > 0) {
        let cUrl = options.queue.shift();
        // log
        self.logger.trace('Url: ', JSON.stringify(cUrl));
        if (cUrl.depth >= 0) {
          // @see Sophia::phantomRun()
          return self.phantomRun(cUrl, options)
            // Push the new constructed url structures to the queue. Also, they
            // will be pushed to the found list. Current url (the one that has
            // been already scanned) will be pushed to ignore list.
            .then(data => {
              options.ignore.push(cUrl.url);
              data.forEach(_cUrl => {
                options.queue.push(_cUrl);
                self.found[options.session].push(_cUrl.url);
              });
            })
            .catch(err => Promise.reject(err))
            // Call the recursive function, in order to move processing to
            // the next url from queue.
            .then(data => _indexUrls(options))
            .catch(err => Promise.reject(err));
        } else {
          // If an url has exceeded the depth we're searching for, just call
          // the recursive function, in order to move processing to the next
          // url in queue.
          self.emit('sophia:queue:depthExceed', cUrl, options);
          self.logger.warn('Depth Exceeded:', JSON.stringify(cUrl));
          return _indexUrls(options);
        }
      } else {
        return Promise.resolve([...new Set(self.found[options.session])].sort());
      }
    })(options);
  }

  /**
   * [indexUrlsQTree description]
   * @param  {Object}  options [description]
   * @return {Promise}         [description]
   */
  indexUrlsQTree(options) {
    let self = this;
    // prepare queue
    options.queue = [{ url: options.url, depth: options.maxDepth }];

    // Define a recursive function for scanning each url that is pushed in the
    // queue.
    return (function _indexUrls(options) {
      // log
      self.logger.trace('Queue:', JSON.stringify(options.queue), options.queue.length, 'to go');
      // If the queue is not empty, obtain the first element from the queue (it's a LIFO queue)
      // and start scanning its content (but only if the depth is good).
      if (options.queue.length > 0) {
        let cUrl = options.queue.shift();
        let promises = null;
        if (!Array.isArray(cUrl)) {
          if (cUrl.depth >= 0) {
            promises = [self.phantomRun(cUrl, options)];
          } else {
            promises = [];
          }
        } else {
          promises = cUrl.filter(_cUrl => {
            if (_cUrl.depth < 0) {
              self.emit('sophia:queue:depthExceed', _cUrl, options);
              self.logger.warn('Depth Exceeded:', JSON.stringify(_cUrl));
              return false;
            }
            return true;
          }).map(_cUrl => self.phantomRun(_cUrl, options));
        }
        if (promises.length) {
          return Promise.all(promises)
            .then(data => {
              // push current url(s) to ignore queue
              if (!Array.isArray(cUrl)) {
                options.ignore.push(cUrl.url);
              } else {
                cUrl.forEach(_cUrl => options.ignore.push(_cUrl.url));
              }
              // for each sets of _data, push the new url sets to queue
              // and also, add the url(s) in _data to found list.
              data.forEach(_data => {
                options.queue.push(_data);
                _data.forEach(_cUrl => {
                  if (self.found[options.session].indexOf(_cUrl.url) < 0) {
                    self.found[options.session].push(_cUrl.url);
                  }
                });
              });
              return data;
            })
            .catch(err => Promise.reject(err))
            // Call the recursive function, in order to move processing to
            // the next url from queue.
            .then(data => _indexUrls(options))
            .catch(err => Promise.reject(err));
        } else {
          // If an url has exceeded the depth we're searching for, just call
          // the recursive function, in order to move processing to the next
          // url in queue.
          self.emit('sophia:queue:depthExceed', cUrl, options);
          self.logger.warn('Depth Exceeded:', JSON.stringify(cUrl));
          return _indexUrls(options);
        }
      } else {
        return Promise.resolve([...new Set(self.found[options.session])].sort());
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
    options.queue = 1;
    // Define a recursive function for scanning each url recursively.
    return (
      /**
       * [_indexUrls description]
       * @param  {Object} sUrl    {url: , depth: } or [{url: , depth: }, ...]
       * @param  {Object} options
       * @return {Promise}
       */
      function _indexUrls(sUrl, options) {
        // log
        self.logger.trace('Queue:', JSON.stringify(options.queue), options.queue.length, 'to go');
        // Queue will serve only to tell when we have nothing else to scan
        // if (options.queue.length) {
        if (options.queue > 0) {
          // Remove from queue, what we're planning to scan @ the moment
          // options.queue = options.queue.filter(val => JSON.stringify(val) !== JSON.stringify(sUrl));
          options.queue --;
          // if sUrl is indeed a {url: , depth: } structure and not an array
          // start scanning the url
          if (!Array.isArray(sUrl)) {
            self.logger.trace('Recusrive call started for: ', JSON.stringify(sUrl));
            return self.phantomRun(sUrl, options)
              // What we get from phantomRun is a set of structures which
              // will be used for the recursive scan after we filter them
              // for depth < 0
              .then(data => {
                // log
                self.logger.trace('Recusrive call ended for: ', JSON.stringify(sUrl));
                return  data.filter(_sUrl => {
                    // mark urls as found
                    self.found[options.session].push(_sUrl.url);
                    // filter for depth
                    if (_sUrl.depth < 0) {
                      // warn
                      self.logger.warn('Depth Exceeded:', JSON.stringify(_sUrl));
                      // event handler
                      self.emit('sophia:queue:depthExceed', _sUrl, options);
                      return false;
                    }
                    return true;
                  });
              })
              .catch(err => Promise.reject(err))
              // prepare the recursive scan
              .then(data => {
                // push the scaned url to the ignore list
                options.ignore.push(sUrl.url);
                // push the new found array to the queue
                self.logger.trace("Pushing to queue: ", JSON.stringify(data));
                // options.queue.push(data);
                options.queue ++;
                // start the recursive call
                return _indexUrls(data, options)
              })
              .catch(err => Promise.reject(err));
          } else { // other create a set o paralel recursive functions to scan
            // each url in the array, and wait for all to end
            if (sUrl.length) {
              // sUrl.forEach(_sUrl => options.queue.push(_sUrl));
              sUrl.forEach(_sUrl => options.queue ++ );
              self.logger.trace('Recusrive call started for (set): ', JSON.stringify(sUrl));
              return Promise.all(sUrl.map(_sUrl => _indexUrls(_sUrl, options)))
                .then(
                  x => self.logger.trace('Recusrive call ended for (set): ', JSON.stringify(sUrl)),
                  e => self.logger.warn('Recusrive call ended for (set) (with error): ', JSON.stringify(sUrl), e.toString())
                );
            } else {
              // return Promise.resolve();
              return _indexUrls(options);
            }
          }
        } else {
          return Promise.resolve();
        }
      }
    )({url: options.url, depth: options.maxDepth}, options)
      .then(
        data => [...new Set(self.found[options.session])].sort(),
        err => self.logger.error('Error: ', err)
      );
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
      // transform urls into {url: , depth: } structures
      .then(data => data.map(url => { return {url: url, depth: cUrl.depth - 1}; }))
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
