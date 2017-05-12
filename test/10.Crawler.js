
var assert = require('assert');
var path = require('path');
var Nightmare = require ('../dist/org/itmc/dalia/crawler/Nightmare').Nightmare;
var Crawler = require ('../dist/org/itmc/dalia/crawler/Crawler').Crawler;

describe('crawler/', function() {

  describe('Nightmare', function() {
    // test
    it('should exist', function() {
      assert.equal(typeof Nightmare, 'function');
    });
    // end test

    describe('::constructor()', function() {
      // test
      it('should instantiate an object', function() {
        var nm = Nightmare.getInstance();
        assert.equal(typeof nm, 'object');
      });
      // end test
      // test
      it('should be instanceof ...', function() {
        var nm = Nightmare.getInstance();
        assert(nm instanceof Nightmare);
        // assert(nm instanceof Crawler);
      });
      // end test

    });

    describe('::fetch()', function() {
      // test
      it('should grab a page without throwing errors', function() {
        var nm = Nightmare.getInstance().fetch('https://github.com', 'h1');
        assert.equal(typeof nm, 'object');
      });
      // end test
      // test
      it('should be instance of ...', function() {
        var nm = Nightmare.getInstance().fetch('https://github.com', 'h1');
        assert(nm instanceof Nightmare);
      });
      // end test
    });

    // describe('::html()', function() {


    //   // test
    //   it('should instantiate an object', function() {
    //     assert.equal(typeof Nightmare.getInstance().grab('https://github.com', 'h1').html(), 'string');
    //   });
    //   // end test

    // });

  });

});

