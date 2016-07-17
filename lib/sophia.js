
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
        var promises = _urlsFromLinkPromiseArray(urls, depth - 1, options);
        if (promises.length) {
          Promise.all(promises).then(function(data) {
          //   data.forEach(function(v) { urls = urls.concat(v) });
            // console.log(urls);
            resolve(options.found);
            log.debug('Discovered urls for (' + url + '):', JSON.stringify(urls));
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
        function(data) { resolve(_urlsFromPageData(data, options)); },
        function(err) { reject(err); }
      )
      .catch(function(err) { reject(err); });
  });
}

function _urlsFromLinkPromiseArray(urls, depth, options) {
  var promises = [];
  urls.forEach(function(v) {
    if (options.ignore.indexOf(v) > -1) return;
    options.ignore.push(v);
    options.found.push(v);
    // var ignorev = options.ignore.concat(urls).filter(function(u) { return v != u; });
    promises.push(_urlsFromLinkPromise(v, depth, options));
  });
  return promises;
}

// defaultSelectors = {
//   _default : 'body'
// };
//
// defaultOptions = {
//   events: {},
//   match : null,
//   ignore: []
// };
//
// /**
//  * [urlsFromLink description]
//  * @method urlsFromLink
//  * @param  {[type]}     url       [description]
//  * @param  {[type]}     selectors [description]
//  * @param  {[type]}     match     [description]
//  * @param  {[type]}     ignore    [description]
//  * @return {[type]}               [description]
//  */
/*function urlsFromLink(url, selectors, options) {
  // discovered urls
  var urls = [];
  // selectors
  selectors = extend(true, {}, defaultSelectors, selectors || {});
  // options
  options = extend(true, {}, defaultOptions, options || {});

  // console.log('Using selectors: ', JSON.stringify(selectors));
  // console.log('Using options: ', JSON.stringify(options));

  return new Promise(function(resolve, reject) {

    _urlsFromLinkPromise(url, selectors, options)
      .then(function(urls) {
        var promises = _urlsFromLinkPromiseArray(urls, selectors, options);
        if (promises.length) {
          Promise.all(promises).then(function(data) {
            data.forEach(function(v) { urls = urls.concat(v) });
            // console.log(urls);
            resolve(urls);
          });
        } else {
          resolve(urls);
          // console.log(urls);
        }
      }, function(err) { reject(err); /*console.error(err); process.exit(1);/ })
      .catch(function(err) { reject(err); /*console.error(err); process.exit(1);/ });

  });
}*/

module.exports = {
  parseUrls: urlsFromLink
}
