
var assert = require('assert');
var path = require('path');
var extend = require('extend');
var Dalia = require ('../dist/org/itmc/dalia/Dalia').Dalia;

// function intersect(a, b) {
//     var d = {};
//     var results = [];
//     for (var i = 0; i < b.length; i++) {
//         d[b[i]] = true;
//     }
//     for (var j = 0; j < a.length; j++) {
//         if (d[a[j]])
//             results.push(a[j]);
//     }
//     return results;
// }

// function compareUrlList(list1, list2) {
//   list2 = list2 || [ 'http://localhost:9000',
//   'http://localhost:9000/#',
//   'http://localhost:9000/#/',
//   'http://localhost:9000/#/child-router',
//   'http://localhost:9000/#/child-router/',
//   'http://localhost:9000/#/child-router/child-router',
//   'http://localhost:9000/#/child-router/users',
//   'http://localhost:9000/#/users' ];
//   var list3 = intersect(list1, list2);
//   if (list1.length == list3.length && list2.length == list3.length) {
//     return true;
//   }
//   console.log(list1, list2, list3);
//   return false;
// }

// describe('org.itmc.dalia.Dalia', function() {

//   // test
//   it('should be a class', function() {
//     assert.equal(typeof Dalia, 'function');
//   });
//   // end test

//   describe('#getInstance()', function() {
//     // test
//     it('should be an object', function() {
//       assert.equal(typeof Dalia.getInstance(), 'object');
//     });
//     // end test
//   });

//   describe('#phantomRun()', function() {
//     // test
//     it('should index the urls of a single page', function(done) {
//       this.timeout(5000);

//       var options = extend(true, Dalia.defaultOptions, {
//         match: /^http(s?):\/\/localhost/i,
//         detector: path.join(__dirname, '../dist/org/itmc/dalia/_detector.geturls.js'),
//         session: 'test',
//         selectors: { __default: '.au-target' }
//       });

//       var dalia = new Dalia();
//       dalia.found = {test: []};

//       var cUrl = {url: 'http://localhost:9000', depth: 1};

//       dalia.phantomRun(cUrl, options).then(function(data) {
//         // console.log(data);
//         assert(data.length > 0, "Didn't get valid data.");
//         assert(compareUrlList(
//           data.map(function(u){return u.url}),
//           ['http://localhost:9000/#', 'http://localhost:9000/#/', 'http://localhost:9000/#/users', 'http://localhost:9000/#/child-router']
//         ) == true, 'Url list doesn\' match.');
//         done();
//       }, done).catch(done);
//     });
//     // end test
//   });

//   describe('#indexUrls()', function() {
//     // test
//     it('(recursive queue) (string) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         session: new Date().getTime(),
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls('http://localhost:9000', options).then(function(data) {
//         // console.log(data);
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(recursive queue) ([string]) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         session: new Date().getTime(),
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls(['http://localhost:9000', 'http://localhost:9000/#/users'], options).then(function(data) {
//         // console.log(data);
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(recursive queue) ([Object]) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         session: new Date().getTime(),
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls([{ url: 'http://localhost:9000/#/users', depth: 0}, { url: 'http://localhost:9000' }], options).then(function(data) {
//         // console.log(data);
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(recursive tree) (string`) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         indexMode: Dalia.INDEX_URL_MODE_RTREE,
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls('http://localhost:9000', options).then(function(data) {
//         // console.log(data);
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(recursive tree) ([string]) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         indexMode: Dalia.INDEX_URL_MODE_RTREE,
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls(['http://localhost:9000', 'http://localhost:9000/#/users'], options).then(function(data) {
//         // console.log(data);
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(recursive tree) ([Object]) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         indexMode: Dalia.INDEX_URL_MODE_RTREE,
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls([{ url: 'http://localhost:9000/#/users', depth: 0}, { url: 'http://localhost:9000' }], options).then(function(data) {
//         // console.log(data);
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(queued recursive tree) (string) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         indexMode: Dalia.INDEX_URL_MODE_QTREE,
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls('http://localhost:9000', options).then(function(data) {
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(queued recursive tree) ([string]) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         indexMode: Dalia.INDEX_URL_MODE_QTREE,
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls(['http://localhost:9000', 'http://localhost:9000/#/users'], options).then(function(data) {
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(queued recursive tree) ([Object]) should return a list of urls', function(done) {
//       this.timeout(120000);
//       var options = {
//         match: /^http(s?):\/\/localhost/i,
//         maxDepth: 1,
//         indexMode: Dalia.INDEX_URL_MODE_QTREE,
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Dalia()).indexUrls([{ url: 'http://localhost:9000/#/users', depth: 0}, { url: 'http://localhost:9000' }], options).then(function(data) {
//         assert(data.length);
//         assert(compareUrlList(data) == true, 'Url list doesn\' match.');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test
//   });
// });
