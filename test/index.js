
var assert = require('assert');
var Logger = require('../index').Logger;
var Phantom = require('../index').Phantom;
var Sophia = require('../index').Sophia;

describe('require("sophia")', function() {

  describe('require("sophia").Logger', function() {
    // test
    it('should exist', function() {
      assert.equal(typeof Logger, 'function');
    });
    // end test

    // test
    it('should instantiate an object', function() {
      assert.equal(typeof Logger.getInstance(), 'function');
    });
    // end test
  });

  describe('require("sophia").Phantom', function() {
    // test
    it('should exist', function() {
      assert.equal(typeof Phantom, 'function');
    });
    // end test

    // test
    it('should instantiate an object', function() {
      assert.equal(typeof Phantom.getInstance(), 'object');
    });
    // end test
  });

  describe('require("sophia").Sophia', function() {
    // test
    it('should exist', function() {
      assert.equal(typeof Sophia, 'function');
    });
    // end test

    // test
    it('should instantiate an object', function() {
      assert.equal(typeof Sophia.getInstance(), 'object');
    });
    // end test
  });

});
