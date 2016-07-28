
var Sophia = require('../index').Sophia;

console.log("To see debugging, run: export DEBUG=\"sophia:*\" before running this script.");

var options = {
  match: /^http(s?):\/\/docs.angularjs.org/i,
  maxDepth: 0,
  selectors: {
    // __default: '.nav-list.naked-list'
    __default: 'div[ng-hide=loading]'
  }
};

var sophia = new Sophia();

sophia.on('sophia:pre:urlValidate', function(ourl) {
  ourl.url = ourl.url.replace(/#.*/g, '').replace(/\/$/g, '');
});

sophia
  .indexUrls('https://docs.angularjs.org/api', options)
  .then(function(data) {
    data.forEach(function(url){ console.log(url); });
    console.log(data.length);
  }, function(err) { console.log(err); })
  .catch(function(err) { console.log(err); });
