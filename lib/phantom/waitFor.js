/**
 * Sophia (SPA) SEO Tool (http://github.com/itmcdev/nodejs-sophia/)
 *
 * @link      http://github.com/itmcdev/nodejs-sophia/ for the canonical source repository
 * @copyright Copyright (c) 2007-2016 IT Media Connect (http://itmediaconnect.ro)
 * @license   http://github.com/itmcdev/nodejs-sophia/LICENSE MIT License
 */
'use strict';

 // Get the start time immediately since we're already in a PhantomJS process instance
 // The spawner is already counting down (with allowances)...
 var start = new Date().getTime();

 /**
  * A havily modified version of the waitFor example from phantomjs' repository.
  * It's scope is to wait for the page's load (given by a testing function).
  *
  * @method waitFor
  * @param  {Function} testFx      Function to test whether the page completed loading (or reached the certain loading status developer needs.)
  * @param  {Function} onReady     Function to serve as callback then testFx returns something different than false.
  * @param  {Function} onTimeout   Function to serve as exit point if timeout occurs.
  * @param  {Number} timeout       Timeout value (we can't run this forever, can't we ...)
  * @param  {Number} checkInterval Interval to run test.
  * @link https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
  */
 function waitFor(testFx, onReady, onTimeout, timeout, checkInterval) {
   var condition = false,
   interval = setInterval(function() {
     if ( (new Date().getTime() - start < timeout) && !condition ) {
       // If not timeout yet and condition not yet fulfilled
       condition = testFx();
     } else {
       clearInterval(interval); // Stop this interval
       if ( !condition ) {
         // If condition still not fulfilled (timeout but condition is 'false')
         onTimeout();
       } else {
         // Condition fulfilled (timeout and/or condition is 'true')
         onReady((new Date().getTime() - start), condition);
       }
     }
   }, checkInterval);
 }


module.exports = waitFor;
