
var polyfill = require('./polyfill');
var child = require('./phantom-child');

var sophia = {

  parseUrls(url, selectors, match, ignore) {
    // discovered urls
    var urls = [];
    // selectors
    selectors = selectors || { '_default' : 'body' };
    selectors._default = selectors._default || 'body';
    // match
    match = match || new RegExp(
      url.replace(/http(s?):\/\//i, '').replace(/\/$/, ''), //.replace(/\//g, '\\/'),
      'i'
    );
    // ignore set
    ignore = ignore || [];

    console.log('Parsing url: ' + url + ' / for selector: ' + (selectors[url] || selectors['_default']));

    // create promise for parsing html
    return new Promise(function(resolve, reject) {
      // spawn phantomjs child
      child(
        url,
        selectors[url] || selectors['_default'],
        { detector: 'parseUrls', filter: 'detector' }
      ).then(
        function(data) {

          var promises = [];
          // if returned data, process information
          JSON.parse(data).forEach(function(m, i) { if (typeof m.content !== 'undefined') {
            m.content.forEach(function(url, i) {
              // if url wasn't added already, is not in ignore list and matches the current domain
              if (!url.match(match) || ignore.indexOf(url) > -1 || urls.indexOf(url) > -1) return;
              // push it to list
              urls.push(url);
            });
          } });
          console.log('Discovered urls', urls.join(', '));
          // for each url, see if you need to scan again
          urls.forEach(function(v) {
            // if not in ignore list
            if (ignore.indexOf(v) > -1) return;
            console.log('Promissing ' + v);
            // launch a promise to obtain data
            promises.push(sofia.parseUrls(
              v,          // one of the discovered urls
              selectors,  // same selectors
              match,      // same matching condition
                          // previous ignore list + found urls without the one we're parsing
              Array.concat(ignore, urls.filter(function(u) { return u !== v; }))
            ));
          });
          // console.log('Stated ' + promises.length + ' promises');
          if (promises.length) {
            Promise.all(promises).then(
              function(data) { resolve(data); },
              function(err) { reject(err); }
            )
          } else {
            resolve(urls);
          }
          
        },
        function(err) { reject(err); }
      );
    });
  }

};

module.exports = sophia;
