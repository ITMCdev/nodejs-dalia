
var path = require('path');
var log = require('./logger');

function phjsPath() {
    var phantomSource = require("phantomjs-prebuilt").path;
    if (path.extname(phantomSource).toLowerCase() === ".cmd") {
        return path.join(path.dirname( phantomSource ), "//node_modules//phantomjs-prebuilt//lib//phantom//bin//phantomjs.exe");
    }
    return phantomSource;
}

var defaultOptions = {
    phantomOptions: ["--ssl-protocol=any", "--ignore-ssl-errors=true"],
    detector: 'default',
    filter: 'default',
    output: 'default'
};

/**
 * @method child
 * @param  {String} url
 * @param  {String} selector
 * @param  {Object} options
 */
function child(url, selector, options) {
    options = require('./polyfill')['Object'].assign({}, defaultOptions, options);
    return new Promise(function(resolve, reject){
        var spawn = require("child_process").spawn;
        var content = '';
        var args = [];
        var key = '';

        options.phantomOptions.forEach(function(v) { args.push(v); })
        args.push(path.join(__dirname, 'phantom.js'));
        args.push('--url=' + url);
        args.push('--selector=' + selector);
        for (key in options) {
            if (options.hasOwnProperty(key) && key != 'phantomOptions') {
                args.push('--use-' + key + '=' + options[key]);
            }
        }

        log.info("Spawning:", phjsPath() + ' ' + args.join(' '));
        cp = spawn(phjsPath(), args);
        cp.stdout.on('data', function(data) { content += data.toString(); });
        cp.stderr.on("data", function(e) { log.error("Error occured spawning " + phjsPath() + ' ' + args.join(' '), e); reject(e) });
        cp.on("exit", function(code) { resolve(content); });
    });
}

module.exports = child;
