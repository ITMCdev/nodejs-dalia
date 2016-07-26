
var Sophia = require('../index').Sophia;

console.log("To see debugging, run: export DEBUG=\"sophia:*\" before running this script.");

var options = {
  match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
  maxDepth: 2
};

var sophia = new Sophia();
sophia.on('sophia:pre:urlValidate', function(ourl) {
  ourl.url = ourl.url.replace(/#.*/g, '').replace(/\/$/g, '');
});

sophia
  .indexUrls('http://html5rocks.com', options)
  .then(function(data) {
    console.log(data);
    console.log(sophia.found[data]);
    console.log(sophia.found[data].length);
  }, function(err) { console.log(err); });
