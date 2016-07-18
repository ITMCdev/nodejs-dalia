
var sophia = require('../index');
var assert = require('assert');

var options = { match: /\/getbootstrap.com/i };
sophia.parseUrls('http://getbootstrap.com', 10, options).then(
    function(data) { console.log(data); console.log(options.found); },
    function(err) { assert.fail(err); }
);
