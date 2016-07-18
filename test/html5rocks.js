
var sophia = require('../index');
var assert = require('assert');

// sophia.parseUrls('http://www.html5rocks.com').then(
//     function(data) { console.log(data); },
//     function(err) { assert.fail(err); }
// );

// sophia.parseUrls('http://www.html5rocks.com', {}, { match: /www.html5rocks.com/i }).then(
//     function(data) { console.log(data); },
//     function(err) { assert.fail(err); }
// );

sophia.parseUrls('http://www.html5rocks.com', 2, { match: /html5rocks.com/i }).then(
    function(data) { console.log(data); },
    function(err) { assert.fail(err); }
);

// sophia.parseUrls('http://casacontelui.ro', 100, { match: /casacontelui.ro/i }).then(
//     function(data) { console.log(data); },
//     function(err) { assert.fail(err); }
// );
