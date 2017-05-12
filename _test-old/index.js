
var assert = require('assert');
var Logger = require('../index').Logger;
var Phantom = require('../index').Phantom;
var Dalia = require('../index').Dalia;

describe('require("dalia")', function() {

  describe('require("dalia").Logger', function() {
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

  describe('require("dalia").Phantom', function() {
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

  describe('require("dalia").Dalia', function() {
    // test
    it('should exist', function() {
      assert.equal(typeof Dalia, 'function');
    });
    // end test

    // test
    it('should instantiate an object', function() {
      assert.equal(typeof Dalia.getInstance(), 'object');
    });
    // end test
  });

});
