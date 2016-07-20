
var assert = require('assert');
var path = require('path');
var Sophia = require ('../dist/org/itmc/sophia/Sophia').Sophia;

(new Sophia()).indexUrls('http://html5rocks.com').then(function(data) {
  console.log(data);
}, function(err) { console.log(err); });

// describe('org.itmc.sophia.Phantom', function() {
//
//   it('should be a class', function() {
//     assert.equal(typeof Phantom, 'function');
//   });
//
//   describe('#getInstance()', function() {
//     it('should be an object', function() {
//       assert.equal(typeof Phantom.getInstance(), 'object');
//     });
//   });
//
//   describe('#run()', function() {
//     // test
//     it('should return a html content object', function(done) {
//       this.timeout(20000);
//       (new Phantom()).run('http://html5rocks.com').then(function(data) {
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
//
//     // test
//     it('should return a html content object and links array', function(done) {
//       this.timeout(20000);
//       var options = {
//         detector: path.join(__dirname, '../dist/org/itmc/sophia/_detector.geturls.js')
//       };
//       (new Phantom()).run('http://html5rocks.com', options).then(function(data) {
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
