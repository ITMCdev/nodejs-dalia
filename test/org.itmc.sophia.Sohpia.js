
var assert = require('assert');
var path = require('path');
var Sophia = require ('../dist/org/itmc/sophia/Sophia').Sophia;

var options = {
  match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
  maxDepth: 1,
  indexMode: Sophia.INDEX_URL_MODE_RTREE
};

// (new Sophia()).indexUrls('http://html5rocks.com', options)
//   .then(function(data) { console.log(data); console.log(data.length); }, function(err) { console.log(err); });

delete options.indexMode;

(new Sophia()).indexUrls('http://html5rocks.com', options)
  .then(function(data) { console.log(data); console.log(data.length); }, function(err) { console.log(err); });

var describe = describe || function(){}
var it = it || function() {}

describe('org.itmc.sophia.Sophia', function() {

  it('should be a class', function() {
    assert.equal(typeof Sophia, 'function');
  });

  describe('#getInstance()', function() {
    it('should be an object', function() {
      assert.equal(typeof Sophia.getInstance(), 'object');
    });
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
  });
});
