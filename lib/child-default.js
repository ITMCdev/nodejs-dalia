
var child = require('../lib/phantom-child');

child('http://google.com', 'body').then(
    function(data) { console.log(data); },
    function(err) { console.error(err); process.exit(1); }
);