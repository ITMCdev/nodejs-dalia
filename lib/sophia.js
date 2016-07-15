
var polyfill = require('./polyfill');
var child = require('./phantom-child');

/**
 * [_urlsFromPageGrab description]
 * @method _urlsFromPageGrab
 * @param  {[type]}               data   [description]
 * @param  {[type]}               match  [description]
 * @param  {[type]}               ignore [description]
 * @return {[type]}                      [description]
 */
function _urlsFromPageGrab(data, match, ignore) {
  var urls = [];
  // console.log(data);
  JSON.parse(data).forEach(function(obj) {
    if (typeof obj.content !== 'undefined') {
      obj.content.forEach(function(url) {
        // if url wasn't added already, is not in ignore list and matches the current domain
        if (!url.match(match) || ignore.indexOf(url) > -1 || urls.indexOf(url) > -1) return;
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
function _urlsFromLinkPromise(url, selectors, match, ignore) {
  return new Promise(function(resolve, reject){
    child(url, selectors[url] || selectors['_default'], { detector: 'parseUrls', filter: 'detector' })
      .then(
        function(data) { resolve(_urlsFromPageGrab(data, match, ignore)); },
        function(err) { reject(err); }
      )
      .catch(function(err) { reject(err); });
  });
}

function _urlsFromLinkPromiseArray(urls, selectors, match, ignore) {
  var promises = [];
  urls.forEach(function(v) {
    if (ignore.indexOf(v) > -1) return;
    var ignorev = ignore.concat(urls).filter(function(u) { return v != u; });
    promises.push(_urlsFromLinkPromise(v, selectors, match, ignorev));
  });
  return promises;
}

/**
 * [urlsFromLink description]
 * @method urlsFromLink
 * @param  {[type]}     url       [description]
 * @param  {[type]}     selectors [description]
 * @param  {[type]}     match     [description]
 * @param  {[type]}     ignore    [description]
 * @return {[type]}               [description]
 */
function urlsFromLink(url, selectors, match, ignore) {
  // discovered urls
  var urls = [];
  // selectors
  selectors = selectors || { '_default' : 'body' };
  selectors._default = selectors._default || 'body';
  // match
  match = match || new RegExp(url.replace(/http(s?):\/\//i, '').replace(/\/$/, '')/*.replace(/\//g, '\\/')*/, 'i');
  // ignore set
  ignore = ignore || [];

  return new Promise(function(resolve, reject) {

    _urlsFromLinkPromise(url, selectors, match, ignore)
      .then(function(urls) {
        var promises = _urlsFromLinkPromiseArray(urls, selectors, match, ignore);
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


// create promise for parsing html
// return new Promise(function(resolve, reject) {
// // spawn phantomjs child
// child(
// url,
// selectors[url] || selectors['_default'],
// { detector: 'urls', filter: 'detector' }
// ).then(
// function(data) {
// // obtained & filtered urls
// var ulrs = _urlsFromPageGrab(data, match, ignore);
// var promises = [];
// // if returned data, process information
// console.log('Discovered urls', urls.join(', '));
// // for each url, see if you need to scan again
// // urls.forEach(function(v) {
// // // if not in ignore list
// // if (ignore.indexOf(v) > -1) return;
// // console.log('Promissing ' + v);
// // // launch a promise to obtain data
// // // promises.push(sofia.urls(
// // //   v,          // one of the discovered urls
// // //   selectors,  // same selectors
// // //   match,      // same matching condition
// // //               // previous ignore list + found urls without the one we're parsing
// // //   Array.concat(ignore, urls.filter(function(u) { return u !== v; }))
// // // ));
// // });
// //   // console.log('Stated ' + promises.length + ' promises');
// //   if (promises.length) {
// //     Promise.all(promises).then(
// //       function(data) { resolve(data); },
// //       function(err) { reject(err); }
// //     )
// //   } else {
// resolve(urls);
// //   }
//
// },
// function(err) { reject(err); }
// );
// });
}

  module.exports = {
    parseUrls: urlsFromLink
  }
