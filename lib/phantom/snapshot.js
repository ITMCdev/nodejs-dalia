/**
* Sophia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-sophia/)
*
* @link      http://github.com/itmcdev/nodejs-sophia/ for the canonical source repository
* @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
* @license   http://github.com/itmcdev/nodejs-sophia/LICENSE MIT License
*/

// console.log('Running phantomjs');


/**
 * Dependencies, phantomjs
 */
var page = require("webpage").create();
var waitFor = require('./waitFor');
var detectors = require('./detectors');
var filters = require('./filters');
var outputs = require('./outputs');
// polyfill
Object.assign = require('../polyfill')['Object'].assign;

var defaultOptions = {
  // url: 'https://google.com',
  selector: 'body',
  timeout: 20000,
  checkInterval: 200
};

/**
 * @method snapshot
 * @param  {Object} options
 * @param  {Function} detector
 * @param  {Function} filter
 */
function snapshot(options, detector, filter, output) {
  // merge options with default values
  options = Object.assign({}, defaultOptions, options);
  // use default filter if none defined
  filter = filter || filters.default;
  // use default detector if none defined
  detector = detector || detectors.default;
  // use default output method if none defined
  output = output || outputs.default;

  // report config and log
  output.start();
  output({options: options});
  output({log: "Creating snapshot for " + options.url + " ..." });

  // https://github.com/ariya/phantomjs/issues/10930
  page.customHeaders = { "Accept-Encoding": "identity" };

  page.onError = function(msg, trace) {
    output({error: msg, trace: trace});
    // output.end();
    // phantom.exit(2);
  };

  // create the snapshot
  page.open(options.url, function (status) {
    if (status !== "success") {
      output({warning: "Unable to load page " + options.url});
      output.end();
      phantom.exit(2);
    } else {
      // phantomJS loaded the page, so wait for it to be ready
      waitFor(

        // The test to determine readiness
        function() { return page.evaluate(detector, { selector: options.selector, url: options.url }); },

        // The onReady callback
        function(time, result) {
          output({content: filter(result, page.content)});
          output({log: "Snapshot for " + options.url + " finished in " + time + " ms"});
          output.end();
          phantom.exit(0);
        },

        // The onTimeout callback
        function() {
          output({error: "Timed out waiting for " + options.selector + " to become visible for " + options.url});
          output.end();
          phantom.exit(1);
        },

        options.timeout,
        options.checkInterval

      );
    }
  });
}

module.exports = snapshot;
