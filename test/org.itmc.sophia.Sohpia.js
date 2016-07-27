
var assert = require('assert');
var path = require('path');
var extend = require('extend');
var Sophia = require ('../dist/org/itmc/sophia/Sophia').Sophia;

describe('org.itmc.sophia.Sophia', function() {

  // test
  it('should be a class', function() {
    assert.equal(typeof Sophia, 'function');
  });
  // end test

  describe('#getInstance()', function() {
    // test
    it('should be an object', function() {
      assert.equal(typeof Sophia.getInstance(), 'object');
    });
    // end test
  });

  describe('#phantomRun()', function() {
    // test
    it('should index the urls of a single page', function(done) {
      this.timeout(120000);
      var options = extend(true, {
        match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
        maxDepth: 1
      }, Sophia.defaultOptions);
      var reject = function(err) { assert(err); done(); };
      var cUrl = {url: 'http://html5rocks.com', depth: 1};

      (new Sophia()).phantomRun(cUrl, options, reject).then(function(data) {
        assert(data.length);
        done();
      },function(err) { assert.ifError(err); });
    });
    // end test
  });

  describe('#indexUrls()', function() {
    // test
    it('(recursive queue) should return a list of urls', function(done) {
      this.timeout(120000);
      var options = {
        match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
        maxDepth: 1
      };
      (new Sophia()).indexUrls('http://html5rocks.com', options).then(function(data) {
        assert(data.length);
        done();
      },function(err) { assert.ifError(err); });
    });
    // end test

    // test
    it('(recursive tree) should return a list of urls', function(done) {
      this.timeout(120000);
      var options = {
        match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
        maxDepth: 1,
        indexMode: Sophia.INDEX_URL_MODE_RTREE
      };
      (new Sophia()).indexUrls('http://html5rocks.com', options).then(function(data) {
        assert(data.length);
        done();
      },function(err) { assert.ifError(err); });
    });
    // end test

    // test
    it('(queued recursive tree) should return a list of urls', function(done) {
      this.timeout(120000);
      var options = {
        match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
        maxDepth: 1,
        indexMode: Sophia.INDEX_URL_MODE_QTREE
      };
      (new Sophia()).indexUrls('http://html5rocks.com', options).then(function(data) {
        assert(data.length);
        done();
      },function(err) { assert.ifError(err); });
    });
    // end test
  });
});
