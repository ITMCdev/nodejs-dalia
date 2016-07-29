
var Dalia = require('../index').Dalia;

console.log("To see debugging, run: export DEBUG=\"dalia:*\" before running this script.");

var options = {
  match: /^http(s?):\/\/docs.angularjs.org/i,
  maxDepth: 1,
  indexMode: Dalia.INDEX_URL_MODE_RTREE,
  selectors: {
    // __default: '.nav-list.naked-list'
    __default: 'div[ng-hide=loading]'
  }
};

var dalia = new Dalia();

dalia.on('dalia:pre:urlValidate', function(self, options, ourl) {
  ourl.url = ourl.url.replace(/#.*/g, '').replace(/\/$/g, '');
});

dalia
  .indexUrls('https://docs.angularjs.org/api', options)
  .then(function(data) {
    data.forEach(function(url){ console.log(url); });
    console.log(data.length);
  }, function(err) { console.log(err); })
  .catch(function(err) { console.log(err); });
