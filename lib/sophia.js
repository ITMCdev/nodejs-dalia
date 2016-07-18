
var log = require('./logger');

var extend = require('extend');
var polyfill = require('./polyfill');
var child = require('./phantom-child');

defaultOptions = {
  match : null,                       // RegExp => force only urls matching this regexp
  selectors: { _default: 'body' },  // selectors for phantom-child
  ignore: [],                         // urls to ignore during the lifetime of the parsing
  found: [],                          // found urls / we need this to keep track of what we already discovered and parsed
  events: {}                          // events
};


/**
 * Will obtain the URL list starting from a browsing point
 * @param  {String}  url     [description]
 * @param  {Number}  depth   [description]
 * @param  {Object}  options [description]
 * @return {Promise}         [description]
 */
function urlsFromLink(url, depth, options) {
  options = extend(true, defaultOptions, options);
  log.debug('Using options:', JSON.stringify(options));
  return new Promise(function(resolve, reject) {
    log.trace('Scanning for urls:', url);
    _urlsFromLinkPromise(url, depth, options)
      .then(function(urls) {
        var promises = /*[];*/_urlsFromLinkPromiseArray(urls, depth - 1, options);
        if (promises.length) {
          Promise.all(promises).then(function(data) {
          //   data.forEach(function(v) { urls = urls.concat(v) });
              // console.log(urls);
            resolve(options.found);
            log.debug('Discovered (recursive) urls for (' + url + '):', JSON.stringify(data));
          });
        } else {
          resolve(options.found);
          log.debug('Discovered urls for (' + url + '):', JSON.stringify(urls));
        }
      }, function(err) { reject(err); /*console.error(err); process.exit(1);*/ })
      .catch(function(err) { reject(err); /*console.error(err); process.exit(1);*/ });
  });
}

/**
 * [_urlsFromPageData description]
 * @method _urlsFromPageData
 * @param  {[type]}               data   [description]
 * @param  {[type]}               match  [description]
 * @param  {[type]}               ignore [description]
 * @return {[type]}                      [description]
 */
function _urlsFromPageData(data, options) {
  log.debug('Parsing data: ', data);
  var urls = [];
  JSON.parse(data).forEach(function(obj) {
    if (typeof obj.content !== 'undefined') {
      obj.content.forEach(function(url) {
        url = url.replace(/#.+/g, '').replace(/\/$/g, '');
        // log.trace('Found & testing URL: ' + url);
        // if url wasn't added already, is not in ignore list and matches the current domain
        if (                                                       // if
          (options.match && !url.match(options.match))             // we have a match filter url doesn't match
          || (options.ignore && options.ignore.indexOf(url) > -1)  // we have an ignore set and url matches set
          || options.found.indexOf(url) > -1                                // url was already added to our list
        ) return;                                                  // don't do anything
        // push it to list
        urls.push(url);
      });
    }
  });
  options.found = options.found.concat(urls);
  return urls;
}

/**
 * [_urlsFromLinkPromise description]
 * @method _urlsFromLinkPromise
 * @param  {[type]}                  url       [description]
 * @param  {[type]}                  selectors [description]
 * @param  {[type]}                  match     [description]
 * @param  {[type]}                  ignore    [description]
 * @return {[type]}                            [description]
 */
function _urlsFromLinkPromise(url, depth, options) {
  log.trace('Tracing options (' + url + ' : ' + depth + '): ' + JSON.stringify(options));
  return new Promise(function(resolve, reject){
    if (depth == 0) {
      log.warn('Depth exceeded (' + url + '). This thread is dying.');
      resolve();
      return;
    }
    child(
      url,
      options.selectors[url] || options.selectors._default ,
      { detector: 'parseUrls', filter: 'detector' }
    )
      .then(
        function(data) {
          options.ignore.push(url);
          resolve(_urlsFromPageData(data, options));
        },
        function(err) { reject(err); }
      )
      .catch(function(err) { reject(err); });
  });
}

function _urlsFromLinkPromiseArray(urls, depth, options) {
  var promises = [];
  urls.forEach(function(v) {
    if (options.ignore.indexOf(v) < 0) {
      promises.push(urlsFromLink(v, depth, options));
    }
  });
  return promises;
}

module.exports = {
  parseUrls: urlsFromLink
}
