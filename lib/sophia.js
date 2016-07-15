
var debugLogger = require('debug-logger');
debugLogger.inspectOptions = {
  colors : true
};
var log = debugLogger();

var extend = require('extend');
var polyfill = require('./polyfill');
var child = require('./phantom-child');

/**
 * [_urlsFromPageData description]
 * @method _urlsFromPageData
 * @param  {[type]}               data   [description]
 * @param  {[type]}               match  [description]
 * @param  {[type]}               ignore [description]
 * @return {[type]}                      [description]
 */
function _urlsFromPageData(data, options) {
  var urls = [];
  // console.log(data, options);
  JSON.parse(data).forEach(function(obj) {
    if (typeof obj.content !== 'undefined') {
      obj.content.forEach(function(url) {
        // console.log('before: '+ url);
        url = url.replace(/#.+/g, '').replace(/\/$/g, '');
        // console.log('after:  ' + url);
        // if url wasn't added already, is not in ignore list and matches the current domain
        if (                                                       // if
          (options.match && !url.match(options.match))             // we have a match filter url doesn't match
          || (options.ignore && options.ignore.indexOf(url) > -1)  // we have an ignore set and url matches set
          || urls.indexOf(url) > -1                                // url was already added to our list
        ) return;                                                  // don't do anything
        // push it to list
        urls.push(url);
      });
    }
  });
  // console.log(urls);
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
function _urlsFromLinkPromise(url, selectors, options) {
  return new Promise(function(resolve, reject){
    child(url, selectors[url] || selectors['_default'], { detector: 'parseUrls', filter: 'detector' })
      .then(
        function(data) { resolve(_urlsFromPageData(data, options)); },
        function(err) { reject(err); }
      )
      .catch(function(err) { reject(err); });
  });
}

function _urlsFromLinkPromiseArray(urls, selectors, options) {
  var promises = [];
  urls.forEach(function(v) {
    if (options.ignore.indexOf(v) > -1) return;
    var ignorev = options.ignore.concat(urls).filter(function(u) { return v != u; });
    promises.push(_urlsFromLinkPromise(v, selectors, extend(true, {}, options, {ignore: ignorev})));
  });
  return promises;
}

defaultSelectors = {
  _default : 'body'
};

defaultOptions = {
  events: {},
  match : null,
  ignore: []
};

/**
 * [urlsFromLink description]
 * @method urlsFromLink
 * @param  {[type]}     url       [description]
 * @param  {[type]}     selectors [description]
 * @param  {[type]}     match     [description]
 * @param  {[type]}     ignore    [description]
 * @return {[type]}               [description]
 */
function urlsFromLink(url, selectors, options) {
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
      }, function(err) { reject(err); /*console.error(err); process.exit(1);*/ })
      .catch(function(err) { reject(err); /*console.error(err); process.exit(1);*/ });

  });
}

module.exports = {
  parseUrls: urlsFromLink
}
