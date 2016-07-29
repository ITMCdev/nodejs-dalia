
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
