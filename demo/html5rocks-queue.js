
var Sophia = require('../index').Sophia;

console.log("To see debugging, run: export DEBUG=\"sophia:*\" before running this script.");

var options = {
  match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
  maxDepth: 2
};

(new Sophia()).indexUrls('http://html5rocks.com', options)
  .then(function(data) { console.log(data); console.log(data.length); }, function(err) { console.log(err); });
