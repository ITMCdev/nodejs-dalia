
/**
 * Default detector
 * @method default
 * @param  {Object} options
 * @return {Boolean}
 */
function _default(options) {
  return document.querySelectorAll(options.selector).length > 0;
}

function _parseUrls(options) {
  if (document.querySelectorAll(options.selector).length > 0) {
    var alist = document.querySelectorAll('a'), hlist = [];
    Array.prototype.forEach.call(alist.length ? alist : [], function(a) {
      hlist.push(a.href);
    });
    return hlist;
  }
  return false;
}

module.exports = {
  'default': _default,
  'parseUrls': _parseUrls
};
