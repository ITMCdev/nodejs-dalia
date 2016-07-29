

/**
 * https://stackoverflow.com/questions/32429488/how-to-redirect-crawlers-requests-to-pre-rendered-pages-when-using-amazon-s3
 * http://phantomjs.org/
 * https://github.com/localnerve/html-snapshots
 * https://github.com/lukekarrys/spa-crawler
 * http://stackoverflow.com/questions/28916699/is-there-a-way-to-listen-to-an-event-in-the-phantom-context-from-page-context
 * https://snippets.aktagon.com/snippets/534-how-to-scrape-web-pages-with-phantomjs-and-jquery
 */

/**
 * for test:
 * http://aurelia.io/hub.html#/doc/api
 * https://docs.angularjs.org/api
 */

module.exports = {
  Logger: require('./dist/org/itmc/dalia/Logger').Logger,
  Phantom: require('./dist/org/itmc/dalia/Phantom').Phantom,
  Dalia: require('./dist/org/itmc/dalia/Dalia').Dalia,
};
