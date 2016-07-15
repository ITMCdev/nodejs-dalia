
var sophia = require('../index');
var assert = require('assert');

sophia.parseUrls('http://aurelia.io/hub.html#/doc/api').then(
    function(data) { console.log(data); },
    function(err) { assert.fail(err); }
);
