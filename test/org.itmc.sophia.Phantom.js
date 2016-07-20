
var assert = require('assert');
var Phantom = require ('../dist/org/itmc/sophia/Phantom').Phantom;

describe('org.itmc.sophia.Phantom', function() {

  it('should be a class', function() {
    assert.equal(typeof Phantom, 'function');
  });

  describe('#getInstance()', function() {
    it('should be an object', function() {
      assert.equal(typeof Phantom.getInstance(), 'object');
    });
  });

  describe('#run()', function() {
    it('should return a html content object', function(done) {
      this.timeout(20000);
      (new Phantom()).run('http://html5rocks.com').then(function(data) {
        try {
          return JSON.parse(data);
        } catch (e) {
          assert.ifError(e);
        }
      }, function(err) { assert.ifError(err); }).then(function(data) {
        var found = false;
        data.forEach(function(record) {
          if (record.result && record.result.content) {
            found = true;
            assert(record.result.content.match(/^<!DOCTYPE html>/i) !== null, 'HTML <!DOCTYPE not found...');
            assert(record.result.content.match(/<\/html>$/i) !== null, 'HTML </html> end tag not found...');
          }
          if (record.error) {
            assert.ifError(record.error);
          }
        });
        assert(found, 'Could not find content variable');
        done();
      });
    });
  });
});
