
var assert = require('assert');
var path = require('path');
var Phantom = require ('../dist/org/itmc/dalia/Phantom').Phantom;

// describe('org.itmc.dalia.Phantom', function() {

//   it('should be a class', function() {
//     assert.equal(typeof Phantom, 'function');
//   });

//   describe('#getInstance()', function() {
//     it('should be an object', function() {
//       assert.equal(typeof Phantom.getInstance(), 'object');
//     });
//   });

//   describe('#run()', function() {
//     // test
//     it('(static html) should return a html content object', function(done) {
//       this.timeout(20000);
//       (new Phantom()).run('http://html5rocks.com').then(function(data) {
//         // console.log(data);
//         var found = false;
//         data.forEach(function(record) {
//           if (record.result && record.result.content) {
//             found = true;
//             assert(record.result.content.match(/^<!DOCTYPE html>/i) !== null, 'HTML <!DOCTYPE not found...');
//             assert(record.result.content.match(/<\/html>$/i) !== null, 'HTML </html> end tag not found...');
//           }
//           if (record.error) {
//             assert.ifError(record.error);
//           }
//         });
//         assert(found, 'Could not find content variable');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(aurelia) should return a html content object', function(done) {
//       this.timeout(20000);
//       var options = {selectors: { __default: 'router-view.au-target' }};
//       (new Phantom()).run('http://localhost:9000', options).then(function(data) {
//         // console.log(data);
//         var found = false;
//         data.forEach(function(record) {
//           if (record.result && record.result.content) {
//             found = true;
//             assert(record.result.content.match(/^<!DOCTYPE html>/i) !== null, 'HTML <!DOCTYPE not found...');
//             assert(record.result.content.match(/<\/html>$/i) !== null, 'HTML </html> end tag not found...');
//           }
//           if (record.error) {
//             assert.ifError(record.error);
//           }
//         });
//         assert(found, 'Could not find content variable');
//         done();
//       },function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(static html) should return a html content object and links array', function(done) {
//       this.timeout(20000);
//       var options = {
//         detector: path.join(__dirname, '../dist/org/itmc/dalia/_detector.geturls.js')
//       };
//       (new Phantom()).run('http://html5rocks.com', options).then(function(data) {
//         // console.log(JSON.stringify(data));
//         var found = false;
//         data.forEach(function(record) {
//           if (record.result && record.result.content) {
//             found = true;
//             assert(record.result.detected.length);
//             assert(record.result.content.match(/^<!DOCTYPE html>/i) !== null, 'HTML <!DOCTYPE not found...');
//             assert(record.result.content.match(/<\/html>$/i) !== null, 'HTML </html> end tag not found...');
//           }
//           if (record.error) {
//             assert.ifError(record.error);
//           }
//         });
//         assert(found, 'Could not find content variable');
//         done();
//       }, function(err) { assert.ifError(err); });
//     });
//     // end test

//     // test
//     it('(aurelia) should return a html content object and links array', function(done) {
//       this.timeout(20000);
//       var options = {
//         detector: path.join(__dirname, '../dist/org/itmc/dalia/_detector.geturls.js'),
//         selectors: { __default: '.au-target' },
//         checkInterval: 500
//       };
//       (new Phantom()).run('http://localhost:9000', options).then(function(data) {
//         // console.log(JSON.stringify(data));
//         var found = false;
//         data.forEach(function(record) {
//           if (record.result && record.result.content) {
//             found = true;
//             assert(record.result.detected.length);
//             assert(record.result.content.match(/^<!DOCTYPE html>/i) !== null, 'HTML <!DOCTYPE not found...');
//             assert(record.result.content.match(/<\/html>$/i) !== null, 'HTML </html> end tag not found...');
//           }
//           if (record.error) {
//             assert.ifError(record.error);
//           }
//         });
//         assert(found, 'Could not find content variable');
//         done();
//       }, function(err) { assert.ifError(err); });
//     });
//     // end test
//   });
// });
