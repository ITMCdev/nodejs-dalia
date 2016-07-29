
var Dalia = require('../index').Dalia;

console.log("To see debugging, run: export DEBUG=\"dalia:*\" before running this script.");

var options = {
  match: /^http(s?):\/\/(www|updates).html5rocks.com/i,
  maxDepth: 2
};

var dalia = new Dalia();
dalia.on('dalia:pre:urlValidate', function(self, options, ourl) {
  ourl.url = ourl.url.replace(/#.*/g, '').replace(/\/$/g, '');
});

dalia
  .indexUrls('http://html5rocks.com', options)
  .then(function(data) {
    data.forEach(function(url){ console.log(url); });
    // dalia.found[data].forEach(function(url){ console.log(url); });
    console.log(data.length);
    // console.log(dalia.found[data].length);
  }, function(err) { console.log(err); })
  .catch(function(err) { console.log(err); });
