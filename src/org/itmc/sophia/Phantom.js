/**
 *
 */

/**
 *
 */
export class Phantom {

  /**
   * Singleton default phantom.js instance.
   * @method getInstance
   * @return {Phantom}
   */
  getInstance(s) {
    return new Phantom(s);
  }

  const defaultOptions = {
    // url: 'https://google.com',
    selector: 'body',
    timeout: 20000,
    checkInterval: 200
  };

  /**
   * Constructor.
   * @method constructor
   * @param  {[type]}    options [description]
   * @return {[type]}            [description]
   */
  constructor(options) {
    this.extend = require('extend');
    this.options = this.extend(true, this.defaultOptions, options);
  }

  exit(result, level) {
    console.log(JSON.stringify(result));
    phantom.exit(2);
  }

  snapshot(url, options) {

    var result = [];
    result.push({options: options});
    result.push({log: "Creating snapshot for " + options.url + " ..." });

    // https://github.com/ariya/phantomjs/issues/10930
    page.customHeaders = { "Accept-Encoding": "identity" };

    page.onError = function(msg, trace) {
      result.push({error: msg, trace: trace});
    };

    // create the snapshot
    page.open(options.url, function (status) {
      if (status !== "success") {
        output({warning: "Unable to load page " + options.url});
        this.exit(result, 2);
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

}
