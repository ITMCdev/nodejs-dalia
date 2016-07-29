# nodejs-sophia

[![npm version](https://badge.fury.io/js/nodejs-sophia.svg)](http://badge.fury.io/js/sophia)
[![Build Status](https://api.travis-ci.org/ITMCdev/nodejs-sophia.svg?branch=master)](http://travis-ci.org/ITMCdev/nodejs-sophia)
[![Coverage Status](https://img.shields.io/coveralls/ITMCdev/nodejs-sophia.svg)](https://coveralls.io/r/ITMCdev/nodejs-sophia?branch=master)
[![Dependency Status](https://david-dm.org/ITMCdev/nodejs-sophia.svg)](https://david-dm.org/ITMCdev/nodejs-sophia)
[![devDependency Status](https://david-dm.org/ITMCdev/nodejs-sophia/dev-status.svg)](https://david-dm.org/ITMCdev/nodejs-sophia#info=devDependencies)
<!-- [![Codacy Badge](https://www.codacy.com/project/badge/03d414fc2e264ef4b40456aae5b52108)](https://www.codacy.com/public/ITMCdev/nodejs-sophia) -->

> Tool for masive html analysis, usefull for SEO and OPA (One Page Application) indexing.

## Overview

**Sophia** is a flexible library that uses PhantomJS to index webpages served from your site. A page is only saved
when a specified selector is detected visible in the output html. This tool is useful when your site is largely ajax
content, or an SPA, and you want your dynamic content indexed by search engines.

**Sophia** is basically a wrapper over [PhantomJS](http://phantomjs.org/), giving the user the possibility to extract
information from the phantom call exactly as they need.

## Getting Started

### Installation

The simplest way to install *nodejs-sophia* is to use *npm*, just `npm install html-snapshots` will download
*nodejs-sophia* and all dependencies.

## Classes Documentation

### org.itmc.sophia.Logger

Logger class is derived from [debug-logger](https://www.npmjs.com/package/debug-logger) package, only instantiating it:

```javascript
const logger = require('sophia').Logger.getInstance();
```

Please be aware, in order to see logs, you need to run `export DEBUG="sophia:*"` before running your own script. A more
complex approach would be setting the level you wish to see, as following

```bash
export DEBUG="sophia:level"
```
where `level` is the logger directive you wish to monitor. To monitor all, use `*`.

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

For version 0.1.0, Sophia would only serve as an URL indexer. This class was born out of need to index our applications'
urls, in order to either create page snapshots, or create sitemap xml.

#### Sophia's events:

TODO:

## Usage Examples

### Creating Sitemap from Indexed Urls

Using (sitemap)[https://www.npmjs.com/package/sitemap], you can create your own sitemap for the website.

```javascript

const Sophia = require('sophia');
const sitemap = require('nodejs-sophia');

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
        require('fs').writeFileSync('/path/to/sitemap.xml', sitemap.toString());
    });
```

### Creating Snapshots from Indexed Urls

Using (html-snapshots)[https://github.com/localnerve/html-snapshots], you can also create snapshots of the entire website.

```javascript

const Sophia = require('sophia');
const htmlSnapshots = require('nodejs-sophia');

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

## Creating Custom Snapshots from Indexed Urls.

For Applications built in frameworks like [Aurelia](http://aurelia.io/) or [Angular](https://angularjs.org/), using
(html-snapshots)[https://github.com/localnerve/html-snapshots], you can also create snapshots of the entire website, and use them along
with your website for correct bot indexing.

Ofcourse, you can always use the version above and `.htaccess` to do the same thing. This is only for excercise purpose.

```javascript

const Sophia = require('sophia');
const htmlSnapshots = require('nodejs-sophia');

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
            selector: options.selectors,            
            snapshotScript: {
                script: "customFilter",
                module: path.join(__dirname, "myFilter.js")
            },
        });
    });
```

#### myFilter.js

Please note, this example is [Aurelia](http://aurelia.io/) only.

```javascript
module.exports = function(content) {
  var filterVersion = "1.0-20141123";

  return content
    .replace('</body>', `<script src="jspm_packages/system.js"></script>
    <script src="config.js"></script>
    <script>
    System.import('aurelia-bootstrapper');
    </script>
</body>`)
    ;
};
```
