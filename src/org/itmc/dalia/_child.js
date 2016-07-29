/**
 * Dalia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-dalia/)
 *
 * Developed in collaboration with PJ Interactive Romania, a member of Brandpath UK (http://brandpath.com)
 *
 * @link      http://github.com/itmcdev/nodejs-dalia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-dalia/LICENSE MIT License
 */
'use strict';

var extend = require('extend');
var fs = require('fs');
var options = {  };
var page = require("webpage").create();
var system = require('system');
var start = new Date().getTime();

/**
 * A havily modified version of the waitFor example from phantomjs' repository.
 * It's scope is to wait for the page's load (given by a testing function).
 *
 * @method waitFor
 * @param  {Function} testFx      Function to test whether the page completed loading (or reached the certain loading status developer needs.)
 * @param  {Function} onReady     Function to serve as callback then testFx returns something different than false.
 * @param  {Function} onTimeout   Function to serve as exit point if timeout occurs.
 * @param  {Number} timeout       Timeout value (we can't run this forever, can't we ...)
 * @param  {Number} checkInterval Interval to run test.
 * @link https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 */
function waitFor(testFx, onReady, onTimeout, timeout, checkInterval, /**retry/**/) {
  var condition = false,
  interval = setInterval(function() {
    if ( (new Date().getTime() - start < timeout) && !condition ) {
      // If not timeout yet and condition not yet fulfilled
      condition = testFx();
    } else {
      clearInterval(interval); // Stop this interval
      if ( !condition ) {
        // If condition still not fulfilled (timeout but condition is 'false')
        onTimeout(/**retry/**/);
        /**waitFor(testFx, onReady, onTimeout, timeout, checkInterval, retry - 1)/**/
      } else {
        // Condition fulfilled (timeout and/or condition is 'true')
        onReady((new Date().getTime() - start), condition);
      }
    }
  }, checkInterval);
}


var defaultOptions = {
  // url: 'https://google.com',
  selector: 'body',
  timeout: 20000,
  checkInterval: 200,
  /**
   * [detector description]
   * @method detector
   * @param  {Object} options
   * @return {Object}
   */
  detector: function(options) {
    if (document.querySelectorAll(options.selector).length > 0) {
      if (options.callback && options.callback.onDetect) {
        return document;
      }
      return true;
    }
    return false;
  }
};

/**
 * [exit description]
 * @method exit
 * @param  {Array}  result
 * @param  {Number} mode
 */
function exit(result, mode) {
  console.log(JSON.stringify(result)); phantom.exit(0);
}

/**
 * @method snapshot
 * @param  {Object} options
 */
function snapshot(options) {
  var result = [
    {trace: options},
    {trace: "Creating snapshot for " + options.url + " ..." }
  ];

  // https://github.com/ariya/phantomjs/issues/10930
  page.customHeaders = { "Accept-Encoding": "identity" };

  page.onError = function(msg, trace) {
    result = result.concat([{warn: msg}, {trace: trace}]);
  };

  page.open(options.url, function (status) {
    if (status !== "success") {
      result.push({error: "Unable to load page " + options.url});
      exit(result, 2);
    } else {
      // phantomJS loaded the page, so wait for it to be ready
      waitFor(

        // The test to determine readiness
        function() { return page.evaluate(options.detector, options); },

        // The onReady callback
        function(time, detected) {
          result = result.concat([{result: {/**/detected: detected,/**//**/ content: page.content/**/}},
            {trace: "Snapshot for " + options.url + " finished in " + time + " ms"}]);
          exit(result, 0);
        },

        // The onTimeout callback
        function(retry) {
          result.push({error: "Timed out waiting for " + options.selector + " to become visible for " + options.url});
          /**if (retry > 0) {
            result.push({error: 'Retrying for ' + retry + ' times.'});
          } else {/**/
          exit(result, 1);
          /**}/**/
        },

        // snapshopt timeout
        options.timeout,

        // snapshot check interval
        options.checkInterval
      );
    }
  });
}

/**
 *
 */
system.args.forEach(function(arg) {
    var match = arg.match(/--([^=]+)=(.+)/g);
    if (match) {
      match = arg.replace('--', '').split('=');
      options[match.shift()] = match.join('=').replace(/^"|"$/g, '');
    }
});

if (options.detector && typeof options.detector === 'string') {
  options.detector = require(options.detector);
}

// console.log(JSON.stringify(options));

/**
 *
 */
snapshot(extend(true, defaultOptions, options));
