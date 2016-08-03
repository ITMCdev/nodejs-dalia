/**
 * Dalia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-dalia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-dalia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-dalia/LICENSE MIT License
 */

import {Logger} from './Logger';
import {Phantom} from './Phantom';

const extend = require('extend');
const uuid = require('uuid');

const path = require('path');
/**
 * @var {EventEmitter}
 * @see https://nodejs.org/api/events.html#events_class_eventemitter
 */
const EventEmitter = require('events');

/**
*
*/
export class Dalia extends EventEmitter {

  /**
   * [INDEX_URL_MODE_QUEUE description]
   * @type {Number}
   */
  static INDEX_URL_MODE_QUEUE = 0x0001;

  /**
   * [INDEX_URL_MODE_QUEUE description]
   * @type {Number}
   */
  static INDEX_URL_MODE_RTREE = 0x0002;

  /**
   * [INDEX_URL_MODE_QUEUE description]
   * @type {Number}
   */
  static INDEX_URL_MODE_QTREE = 0x0003;

  // /**
  //  * [_found description]
  //  * @type {Array}
  //  */
  // private _found = null;
  //
  // /**
  //  * [_logger description]
  //  * @type {Object}
  //  */
  // private _logger = null;
  //
  // /**
  //  * [_phantom description]
  //  * @type {Phantom}
  //  */
  // private _phantom = null;

  static defaultOptions = {
    indexMode: 0x0001,                  // urls can be indexed by using a lifo queue which should
                                        // allow a more sync parse, yet slower  or by using a tree recursive
                                        // algorithm which will be faster yet a possible memory eater.
    ignore: [],                         // urls to ignore during the lifetime of the parsing
    match : null,                       // RegExp => force only urls matching this regexp
    maxDepth: 5,                        // depth of url scan
    selectors: { __default: 'body' },   // selectors for phantom-child
  };

  /**
   * Singleton
   * @return {Dalia} [description]
   */
  static getInstance() {
    return new Dalia();
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
    options = extend(true, Dalia.defaultOptions, options);
    options.url = url;
    options.detector = path.join(__dirname, '_detector.geturls.js');
    // options.found = [url];


    options.session = uuid.v4();
    this.found[options.session] = [];

    switch (options.indexMode) {
      case Dalia.INDEX_URL_MODE_QTREE:
        return this.indexUrlsQTree(options);
      case Dalia.INDEX_URL_MODE_RTREE:
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
      self.logger.debug('Queue:', options.queue.length, 'to go');
      // If the queue is not empty, obtain the first element from the queue (it's a LIFO queue)
      // and start scanning its content (but only if the depth is good).
      if (options.queue.length > 0) {
        // obtain url structure
        let cUrl = options.queue.shift();
        self.logger.debug("Indexing:", JSON.stringify(cUrl));
        // add url to ignore list
        options.ignore.push(cUrl.url);
        //emit
        self.emit('dalia:urlFound', self, options, cUrl);
        // add url to found list
        if (self.found[options.session].indexOf(cUrl.url) < 0) {
          self.found[options.session].push(cUrl.url);
        }
        if (cUrl.depth >= 0) {
          // @see Dalia::phantomRun()
          return self.phantomRun(cUrl, options)
            // Push the new constructed url structures to the queue. Also, they
            // will be pushed to the found list.
            .then(data => {
              data.forEach(_cUrl => {
                if (options.queue.filter(v => self.sUrlEquals(_cUrl, v)).length == 0) {
                  options.queue.push(_cUrl);
                }
              });
              // emit partial found event
              self.emit('dalia:phantom:partialFound', self, options, data.map(_cUrl => _cUrl.url));
              self.logger.debug("Discovered", data.length, 'new links,', self.found[options.session].length, 'indexed');
              return data;
            })
            // Call the recursive function, in order to move processing to
            // the next url from queue.
            .then(data => _indexUrls(options));
        } else {
          // If an url has exceeded the depth we're searching for, just call
          // the recursive function, in order to move processing to the next
          // url in queue.
          self.emit('dalia:queue:depthExceed', self, options, cUrl);
          self.logger.warn('Depth Exceeded:', JSON.stringify(cUrl));
          return _indexUrls(options);
        }
      } else {
        self.emit('dalia:indexedUrls', self, options, self.found[options.session]);
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
    return (
      /**
       * [_indexUrls description]
       * @param  {Object} options
       * @return {Promise}
       */
      function _indexUrls(options) {
        // log
        self.logger.trace('Queue:', JSON.stringify(options.queue), options.queue.length, 'to go');
        // If the queue is not empty, obtain the first element from the queue (it's a LIFO queue)
        // and start scanning its content (but only if the depth is good).
        if (options.queue.length > 0) {
          let cUrl = options.queue.shift();
          let promises = null;
          if (!Array.isArray(cUrl)) {
            cUrl = [cUrl];
          }

          promises = cUrl.filter(_cUrl => {
            // push url to ignore list
            options.ignore.push(_cUrl.url);
            // emit
            self.emit('dalia:urlFound', self, options, _cUrl);
            // add url to found list
            self.found[options.session].push(_cUrl.url);
            // depth check
            if (_cUrl.depth < 0) {
              // emit
              self.emit('dalia:queue:depthExceed', self, options, _cUrl);
              // log
              self.logger.warn('Depth Exceeded:', JSON.stringify(_cUrl));
              return false;
            }
            // search for the url in all the structures, so it won't be added to queue again
            if (options.queue.filter(v => {
              var found = false;
              if (Array.isArray(v)) {
                if (v.filter(w => self.sUrlEquals(cUrl, w)).length) {
                  found = true;
                }
                return found;
              }
              return self.sUrlEquals(cUrl, v);
            }).length) {
              return false;
            }
            return true;
          }).map(_cUrl => self.phantomRun(_cUrl, options));

          if (promises.length) {
            return Promise.all(promises)
              // for each sets of _data, push the new url sets to queue
              // and also, add the url(s) in _data to found list.
              .then(data => data.forEach(_data => options.queue.push(_data)))
              // Call the recursive function, in order to move processing to
              // the next url from queue.
              .then(data => _indexUrls(options));
          } else {
            return _indexUrls(options);
          }
        } else {
          self.emit('dalia:phantom:found', self, options, self.found[options.session]);
          return Promise.resolve([...new Set(self.found[options.session])].sort());
        }
      }
    )(options);
  }

  /**
   * [indexUrlsRTree description]
   * @method indexUrlsRTree
   * @param  {Object}  options
   * @return {Promise}
   */
  indexUrlsRTree(options) {
    let self = this;
    // one link should assume only one step
    options.steps = 1;
    options.trace = [];
    // retunring a recusrive function call
    return (
      /**
       * [_indexUrls description]
       * @param  {Object} sUrl    {url: , depth: } or [{url: , depth: }, ...]
       * @param  {Object} options
       * @return {Promise}
       */
      function _indexUrls(options) {
        // log
        self.logger.trace('Queue:', options.steps, 'to go');
        // if we still have steps, let's address them
        if (options.steps > 0) {
          let sUrl = options.sUrl;
          let promises = [];
          options.steps --;
          //
          if (!Array.isArray(options.sUrl)) {
            sUrl = [sUrl];
          }

          // filter found url by depth and create prommise list
          promises = sUrl.filter(_sUrl => {
            // push url to ignore list
            options.ignore.push(_sUrl.url);
            // emit
            self.emit('dalia:urlFound', self, options, _sUrl);
            // add url to found list
            self.found[options.session].push(_sUrl.url);
            // depth condition
            if (_sUrl.depth < 0) {
              // emit
              self.emit('dalia:queue:depthExceed', self, options, _sUrl);
              // log
              self.logger.warn('Depth Exceeded:', JSON.stringify(_sUrl));
              return false;
            }
            // don't add url if it is already in scanning process
            if (options.trace.filter(v => self.sUrlEquals(v, _sUrl)).length) {
              return false;
            }
            options.trace.push(_sUrl);
            return true;
          }).map(_sUrl => { return self.phantomRun(_sUrl, options); });

          if (promises.length) {
            return Promise.all(promises)
              .then(data => {
                // for each sets of _data, push the new url sets to queue
                // and also, add the url(s) in _data to found list.
                return data.map(_data => {
                  options.steps ++;
                  return _indexUrls(extend(options, {sUrl: _data}));
                });
              })
              .then(data => Promise.all(data).then(_data => Promise.resolve([...new Set(self.found[options.session])].sort())), err => {throw err;});
              // .then(data => Promise.all(data).then(_data => _indexUrls(extend(options, {sUrl: {url:null, depth:-1}}))));
          } else {
            return _indexUrls(extend(options, {sUrl: {url:null, depth:-1}}));
          }
        } else {
          self.emit('dalia:phantom:found', self, options, self.found[options.session]);
          return Promise.resolve([...new Set(self.found[options.session])].sort());
        }
      }
    )(extend(options, {sUrl: { url: options.url, depth: options.maxDepth }}));
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
        this.emit('dalia:phantom:run-' + key, rec[key]);
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
    this.emit('dalia:phantom', cUrl, options);
    // call URL
    return this.getPhantom()
      .run(cUrl.url, this.phantomOptions(cUrl, options))
      // .then(data => { console.log(data); return data; })
      // obtain page content
      .then(data => this.phantomParseResult(data, cUrl))
      // obtain the detected urls
      .then(data => {
        var result = data.pop().result;
        this.emit('dalia:phantom:resultDiscovered', this, options, cUrl, result);
        return result.detected;
      })
      // .then(data => { console.log(data); return data; })
      // clean url form
      .then(data => data.map((url) => {
        var ourl = { url: url };
        this.emit('dalia:pre:urlValidate', this, options, ourl);
        return ourl.url;
      }))
      // .then(data => { console.log(data); return data; })
      // filter the urls to be valid
      .then(data => {
        return data.filter(url => {
          url = this.urlValidate(url, cUrl, options);
          let ourl = { url: url };
          this.emit('dalia:post:urlValidate', this, options, ourl);
          return ourl.url;
        });
      })
      // .then(data => { console.log(data); return data; })
      // transform urls into {url: , depth: } structures
      .then(data => data.map(url => { return {url: url, depth: cUrl.depth - 1}; }))
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
    // try {
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
    // } catch (e) {
    //   throw e;
    // }
    // return false;
  }

  /**
   * Compare two url structures (if they are equals) {url:, depth:}
   * @param  {Object} sUrl1
   * @param  {Object} sUrl2
   * @return {Boolean}
   */
  sUrlEquals(sUrl1, sUrl2) {
    return sUrl1.url === sUrl2.url && sUrl1.depth === sUrl2.depth;
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
