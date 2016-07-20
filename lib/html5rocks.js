
var sophia = require('../index');
var assert = require('assert');

var options = { match: /^http(s?):\/\/(www|updates).html5rocks.com/i, maxDepth: 2 };
// var options = { match: /www.html5rocks.com/i, maxDepth: 2 };

// sophia.parseUrls('http://www.html5rocks.com', options).then(
//     function(data) { console.log(data); },
//     function(err) { assert.fail(err); }
// );

options.maxDepth = 1;
sophia.siteMap('http://www.html5rocks.com', options);

// sophia.parseUrls('http://casacontelui.ro', { match: /casacontelui.ro/i, maxDepth: 2 }).then(
//     function(data) { console.log(data); },
//     function(err) { assert.fail(err); }
// );
