

var fs = require('fs');
var path = require('path');

var extend = require('extend');

var log = require('./logger');
var polyfill = require('./polyfill');
var child = require('./phantom-child');


defaultOptions = {
  match : null,                       // RegExp => force only urls matching this regexp
  selectors: { _default: 'body' },    // selectors for phantom-child
  ignore: [],                         // urls to ignore during the lifetime of the parsing
  events: {},                         // events
  sitemap: { _default: {} },
  maxDepth: 5,                        // depth of url scan
  output: '.'
};

/**
 * [urlsFromLink description]
 * @param  {[type]} url     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function urlsFromLink(url, options) {
  // extend options
  options = extend(true, defaultOptions, options);
  // initialize found urls
  options.found = options.found || [url];
  // initialize scanning queue
  options.queue = options.queue || [{url: url, depth: options.maxDepth}];
  log.trace(JSON.stringify(options));
  // scan
  return new Promise(function(resolve, reject) {
    function _urlsFromLink(options) {
        if (options.queue.length) {
          _urlsFromLinkPromise(options).then(function() {
            log.trace('---------');
            _urlsFromLink(options);
            // resolve(options.found);
          });
        } else {
          resolve(options.found);
        }
    }
    _urlsFromLink(options);
  });
}

/**
 * [siteMapFromLink description]
 * @param  {[type]} url     [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function siteMapFromLink(url, options) {
  function _siteMapFromLink(urls, options) {
    urls = urls.map(function(v, i) {
      var r = extend(true, options.sitemap._default, { url: v });
      for (var key in options.sitemap) {
        if (options.sitemap.hasOwnProperty(key)) {
          if (typeof options.sitemap[key] === 'string' && v == options.sitemap[key]) {
            r = extend(true, r, v = options.sitemap[key]);
          }
          if (typeof options.sitemap[key] === 'regexp' && v.match(options.sitemap[key])) {
            r = extend(true, r, v = options.sitemap[key]);
          }
        }
      }
      return r;
    });
    log.trace('Writing SiteMap: ', JSON.stringify(urls));
    var sitemap = require('sitemap').createSitemap({
      hostname: url,
      cacheTime: 600000,  //600 sec (10 min) cache purge period
      urls: urls
    });

    log.trace('Writing SiteMap to: ', path.join(options.output, "sitemap.xml"));
    fs.writeFileSync(path.join(options.output, "sitemap.xml"), sitemap.toString());
    resolve(urls);
  }

  return new Promise(function(resolve, reject){
    urlsFromLink(url, options)
      .then(_siteMapFromLink, function(err) { reject(err); })
      .catch(function(err) { reject(err); })
  });
}

/**
 * [_urlsFromPageData description]
 * @method _urlsFromLinkParse
 * @param  {[type]}               data   [description]
 * @param  {[type]}               match  [description]
 * @param  {[type]}               ignore [description]
 * @return {[type]}                      [description]
 */
function _urlsFromLinkParse(data, options) {
  var urls = [];
  JSON.parse(data).forEach(function(obj) {
    if (typeof obj.content !== 'undefined') {
      obj.content.forEach(function(url) {
        url = url.replace(/#.*/g, '').replace(/\/$/g, '');
        // log.trace('Found & testing URL: ' + url);
        // if url wasn't added already, is not in ignore list and matches the current domain
        if (                                                        // if
          (options.match && !url.match(options.match))              // we have a match filter url doesn't match
          || (options.ignore && options.ignore.indexOf(url) > -1)   // we have an ignore set and url matches set
          || options.found.indexOf(url) > -1                        // url was already added to our list
          || url.match(/^mailto:/)                                  // url is an email
        ) return;                                                   // don't do anything
        // push it to list
        urls.push(url);
      });
    }
  });
  log.debug('New urls found:', JSON.stringify(urls));
  // merge new found list with the old one
  options.found = require('./polyfill')['Array'].unique(options.found.concat(urls));
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
function _urlsFromLinkPromise(options) {
  return new Promise(function(resolve, reject) {
    // obtain url object
    var cUrl = options.queue.shift();
    log.debug('Attepmt to scan url: ' + JSON.stringify(cUrl));
    // check if depth exceeded
    if (cUrl.depth >= 0) {
      // grab url
      var selector = options.selectors[cUrl.url] || options.selectors._default;
      var childOptions = { detector: 'parseUrls', filter: 'detector' };
      child(cUrl.url, selector, childOptions).then(function(data) {
          log.trace(cUrl.url + ' returned ' + JSON.stringify(data));
          // push current link to ignore list
          options.ignore.push(cUrl.url);
          // parse and push found urls to queue
          _urlsFromLinkParse(data, options).forEach(function(url) {
            // if (options.queue.filter(function(v){
            //   return v.url != url;
            // }).length == 0 ) {
              options.queue.push({ url: url, depth: cUrl.depth - 1 });
            // }
          });
          log.trace('Updated queue: ', JSON.stringify(options.queue));
          // resolve
          resolve();
        }, function(err) {
          reject(err); /** log.error(err); process.exit(1); /**/
        }).catch(function(err) {
          reject(err); /** log.error(err); process.exit(1); /**/
        });
    } else {
      log.warn('Depth exceeded for url: ' + cUrl.url);
      // resolve
      resolve();
    }
  });
}

module.exports = {
  parseUrls: urlsFromLink,
  siteMap: siteMapFromLink
}
