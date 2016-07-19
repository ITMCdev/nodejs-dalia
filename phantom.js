
var extend = require('extend');
var fs = require('fs');
var options = {  };
var system = require('system');

system.args.forEach(function(arg) {
    var match = arg.match(/--([^=]+)=(.+)/g);
    if (match) {
      match = arg.replace('--', '').split('=');
      options[match.shift()] = match.join('=');
    }
});

console.log(JSON.stringify(options));

phantom.exit(0);
