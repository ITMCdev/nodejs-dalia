
var snapshot = require('./phantom/snapshot.js');
var system = require('system');

var detector = require('./phantom/detectors').parseUrls;
var filter = require('./phantom/filters').detector;

snapshot({ url: system.args[1] }, detector, filter);
