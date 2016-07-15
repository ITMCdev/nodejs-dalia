
var sophia = require('../index');
var assert = require('assert');

sophia.parseUrls('http://getbootstrap.com', {}, { match: /getbootstrap.com/i }).then(
    function(data) { console.log(data); },
    function(err) { assert.fail(err); }
);
