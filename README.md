# nodejs-sophia

## Overview

## Getting Started

## More Information

## Classes Documentation

### org.itmc.sophia.Logger

Logger class is derived from [debug-logger](https://www.npmjs.com/package/debug-logger) package, only instantiating it:

```javascript
const logger = require('sophia').Logger.getInstance();
```

Please be aware, in order to see logs, you need to run:

```bash
export DEBUG="sophia:level"
```
in your sell where `level` is the logger directive you wish to monitor. To monitor all, use `*`.

### org.itmc.sophia.Phantom

Phantom is a simple instantiator for phantomjs, in order to catch the result of phantomjs and work with it further:

```javascript
const phantom = require('sophia').Phantom.getInstance();
phantom.run('http://html5rocks.com')
    .then((data) => { console.log(data) });
```
#### Run options

* **selector** : *'body'* => The selector for which PhantomJs should wait when page is loaded.
* **timeout** : *20000* => Number of seconds after which PhantomJs request is considered as expired.
* **checkInterval**: *200* => Check interval for the **selector**.
* **detector** : Function() => The default detector is a function returning the page's document object (`return document`). However, this parameter can also be a string path to a file which includes a different detector function.

```javascript
// default detector
//...
  detector: function(options) {
    if (document.querySelectorAll(options.selector).length > 0) {
      if (options.callback && options.callback.onDetect) {
        return document;
      }
      return true;
    }
    return false;
  }
//...

// detector returning all the urls within the page as well
// ...
module.exports = function(options) {
  if (document.querySelectorAll(options.selector).length > 0) {
    var alist = document.querySelectorAll('a'), hlist = [];
    Array.prototype.forEach.call(alist.length ? alist : [], function(a) {
      hlist.push(a.href);
    });
    return hlist;;
  }
  return false;
}
// ...
```

### org.itmc.sophia.Sophia

## Usage Examples

### Creating Sitemap from Indexed Urls

https://www.npmjs.com/package/sitemap

```javascript

const Sophia = require('sophia');
const sitemap = require('html-snapshots');

const options = {
    maxDepth: 2,
    selectors: {
        __default: 'body'
    }
};

Sophia.getInstance()
    .indexUrls('http://html5rocks.com', options)
    .then((urls) => {
        let sitemap = sm.createSitemap ({
            hostname: 'http://html5rocks.com',
            cacheTime: 600000,
            urls: urls.map(url => { url: url,  changefreq: 'daily', priority: 0.3 })
        });
        require(fs).writeFileSync('/path/to/sitemap.xml', sitemap.toString());
    });
```

### Creating Snapshots from Indexed Urls

https://www.npmjs.com/package/html-snapshots

```javascript

const Sophia = require('sophia');
const htmlSnapshots = require('html-snapshots');

const options = {
    maxDepth: 2,
    selectors: {
        __default: 'body'
    }
};

Sophia.getInstance()
    .indexUrls('http://html5rocks.com', options)
    .then((urls) => {
        var result = htmlSnapshots.run({
            input: 'array',
            source: urls,
            outputDir: './snapshots',
            outputDirClean: true,  
            selector: options.selectors
        });
    });
```

## Creating Custom Snapshots from Indexed Urls

https://www.npmjs.com/package/html-snapshots

```javascript

const Sophia = require('sophia');
const htmlSnapshots = require('html-snapshots');

const options = {
    maxDepth: 2,
    selectors: {
        __default: 'body'
    }
};

Sophia.getInstance()
    .indexUrls('http://html5rocks.com', options)
    .then((urls) => {
        var result = htmlSnapshots.run({
            input: 'array',
            source: urls,
            outputDir: './snapshots',
            outputDirClean: true,  
            selector: options.selectors
        });
    });
```
