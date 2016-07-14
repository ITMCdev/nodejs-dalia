
var polyfill = require('./polyfill');
var child = require('./phantom-child');

var sophia = {

    urls: [],

    parseUrls(url, selectors, match, ignore) {
        selectors = selectors || { "_default" : 'body' };
        selectors._default = selectors._default || 'body';
        match = match || new RegExp(
            url.replace(/http(s?):\/\//i, '').replace(/\/$/, ''), //.replace(/\//g, '\\/'), 
            'i'
        );
        ignore = ignore || []; 
        return new Promise(function(resolve, reject) {
            child(
                url,
                selectors[url] || selectors['_default'],
                { detector: 'parseUrls', filter: 'detector' }
            ).then(
                function(data) {
                    JSON.parse(data).forEach(function(m, i) {
                        if (typeof m.content !== 'undefined') {
                            m.content.forEach(function(url, i) {
                                console.log(url, match, ignore);
                                if (!url.match(match)) return;
                                if (ignore.indexOf(url) > -1) return;
                                if (sophia.urls.indexOf(url) > -1) return;
                                sophia.urls.push(url);
                            });
                        }
                    });
                    resolve();
                },
                function(err) { reject(err); }
            );
        });
    },

    flushUrls: function() {
        var list = this.urls.filter(function(v){ return true; });
        this.urls = [];
        return list;
    } 

};

module.exports = sophia;