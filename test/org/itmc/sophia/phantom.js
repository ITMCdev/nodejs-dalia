
var assert = require('assert');
var Phantom = require ('../../../../dist/org/itmc/sophia/Phantom').Phantom;

assert.equal(typeof Phantom, 'function');
assert.equal(typeof Phantom.getInstance(), 'object');

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
    }
    if (record.error) {
      assert.ifError(record.error);
    }
  });
  assert(found, 'Could not find content variable');
  console.log(data);
});
