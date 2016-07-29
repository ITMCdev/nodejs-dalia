
var assert = require('assert');
var path = require('path');
var extend = require('extend');
var Dalia = require ('../dist/org/itmc/dalia/Dalia').Dalia;

describe('org.itmc.dalia.Dalia', function() {

  // test
  it('should be a class', function() {
    assert.equal(typeof Dalia, 'function');
  });
  // end test

  describe('#getInstance()', function() {
    // test
    it('should be an object', function() {
      assert.equal(typeof Dalia.getInstance(), 'object');
    });
    // end test
  });

  describe('#phantomRun()', function() {
    // test
    it('should index the urls of a single page', function(done) {
      this.timeout(5000);

      var options = extend(true, Dalia.defaultOptions, {
        match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
        detector: path.join(__dirname, '../dist/org/itmc/dalia/_detector.geturls.js'),
        session: 'test'
      });

      var dalia = new Dalia();
      dalia.found = {test: []};

      var cUrl = {url: 'http://html5rocks.com', depth: 1};

      dalia.phantomRun(cUrl, options).then(function(data) {
        assert(data.length > 0, "Didn't get valid data.");
        done();
      }, done).catch(done);
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
      (new Dalia()).indexUrls('http://html5rocks.com', options).then(function(data) {
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
        indexMode: Dalia.INDEX_URL_MODE_RTREE
      };
      (new Dalia()).indexUrls('http://html5rocks.com', options).then(function(data) {
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
        indexMode: Dalia.INDEX_URL_MODE_QTREE
      };
      (new Dalia()).indexUrls('http://html5rocks.com', options).then(function(data) {
        assert(data.length);
        done();
      },function(err) { assert.ifError(err); });
    });
    // end test
  });
});
