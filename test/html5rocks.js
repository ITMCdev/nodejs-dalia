
var sophia = require('../index');
var assert = require('assert');

sophia.parseUrls('http://www.html5rocks.com').then(
    function(data) { console.log(sophia.flushUrls()); },
    function(err) { assert.fail(err); }
);