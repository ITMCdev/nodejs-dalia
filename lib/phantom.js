
var snapshot = require('./phantom/snapshot.js');
var system = require('system');
var fs = require('fs');

var options = {  };
var optionsArray = ['url', 'selector', 'tiemout', 'checkInterval'];
var sarguments = { detector: null, filter: null, output: null };
var argumentsArray = ['detector', 'filter', 'output'];

argumentsArray.forEach(function(va, i) {
    system.args.forEach(function(aa, j) {
        if (i < 0) return;
        var a = '--use-' + va + '=';
        // console.log(aa, a, aa.indexOf(a));
        if (aa.indexOf(a) > -1) {
            // sarguments[va] = aa.replace(a, '');
            // TODO: Should be able to import other files too.
            sarguments[va] = require('./phantom/' + va + 's')[aa.replace(a, '')];
            // console.log(sarguments[va]);
        }
    });
});

optionsArray.forEach(function(vo, i) {
    system.args.forEach(function(ao, j) {
        if (i < 0) return;
        var o = '--' + vo + '=';
        if (ao.indexOf(o) > -1) {
            options[vo] = ao.replace(o, '');
        }
    });
});


// var args = [options];
// argumentsArray.forEach(function(v) {
//     args.push(sarguments[v]);
// })
// console.log(JSON.stringify(args));
// snapshot.apply(null, [args]);
snapshot.call(null, options, sarguments.detector, sarguments.filter, sarguments.output);
