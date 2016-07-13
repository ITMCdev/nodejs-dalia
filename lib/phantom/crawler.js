/**
 * Sophia ... (http://github.com/itmcdev/nodejs-sophia/)
 *
 * @link      http://github.com/itmcdev/nodejs-sophia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-sophia/LICENSE MIT License
 */

// This script is inspired by Alex Grant's html-snapshot (https://github.com/localnerve/html-snapshots)
// project, so most of the credit goes to him.


// Get the start time immediately since we're already in a PhantomJS process instance
// The spawner is already counting down (with allowances)...
var start = new Date().getTime();

/** Dependencies, phantomjs */
var page = require("webpage").create();

/**
 * waitFor 
 * Heavily borrowed from phantomJS 'waitFor' example
 */
function waitFor(testFx, onReady, onTimeout, timeout, checkInterval) {
  var condition = false,
  interval = setInterval(function() {
    if ( (new Date().getTime() - start < timeout) && !condition ) {
      // If not timeout yet and condition not yet fulfilled
      condition = testFx();
    } else {
      clearInterval(interval); // Stop this interval
      if ( !condition ) {
        // If condition still not fulfilled (timeout but condition is 'false')
        onTimeout();
      } else {
        // Condition fulfilled (timeout and/or condition is 'true')
        onReady((new Date().getTime() - start));
      }
    }
  }, checkInterval);
}

var defaultOptions = {
    // url: 'https://google.com',
    selector: 'body',
    timeout: 200,
    checkInterval: 20000
};

/**
 * snapshot
 *
 * Opens the page and waits for the selector to become visible. Then takes the html snapshot.
 * Applies an optional output filter to the html content.
 * 
 * @param {Object} options 
 */
function cralwer(options, detector, filter) {
  var options = Object.assign({}, defaultOptions, options || {});
  filter = filter || function(content) { return content; };
  detector = detector || function(options) { return document.querySelectorAll('body').length > 0; }

  console.log("Creating snapshot for " + options.url + "...");

  // https://github.com/ariya/phantomjs/issues/10930
  page.customHeaders = {
    "Accept-Encoding": "identity"
  };

  // create the snapshot
  page.open(options.url, function (status) {
    if (status !== "success") {
      // if phantomJS could not load the page, so end right now
      console.error("Unable to load page " + options.url);
      phantom.exit(2);
    } else {
      // phantomJS loaded the page, so wait for it to be ready
      waitFor(

        // The test to determine readiness
        function() {
          return page.evaluate(detector, {
            selector: options.selector,
            url: options.url
          });
        },

        // The onReady callback
        function(time) {
          filter(page.content);
          console.log("snapshot for "+options.url+" finished in "+time+" ms\n  written to "+options.outputFile);
          phantom.exit(0);
        },

        // The onTimeout callback
        function() {
          console.error("timed out waiting for "+options.selector+" to become visible for "+options.url);
          phantom.exit(1);
        },

        options.timeout,
        options.checkInterval

      );
    }
  });
}

module.exports = cralwer;