
var Sophia = require('../index').Sophia;

console.log("To see debugging, run: export DEBUG=\"sophia:*\" before running this script.");

var options = {
  match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
  maxDepth: 2,
  indexMode: Sophia.INDEX_URL_MODE_RTREE
};

var sophia = new Sophia();
sophia.on('sophia:pre:urlValidate', function(self, options, ourl) {
  ourl.url = ourl.url.replace(/#.*/g, '').replace(/\/$/g, '');
});

sophia
  .indexUrls('http://html5rocks.com', options)
  .then(function(data) {
    data.forEach(function(url){ console.log(url); });
    // sophia.found[data].forEach(function(url){ console.log(url); });
    console.log(data.length);
    // console.log(sophia.found[data].length);
  }, function(err) { console.log(err); })
  .catch(function(err) { console.log(err); });
