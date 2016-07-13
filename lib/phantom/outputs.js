
function _default(content, mode) {
  mode = mode || 'log';
  console[mode](JSON.stringify(content) + ',');
}

_default.start = function() {
  console.log('[');
}

_default.end = function() {
  console.log('{}]');
}

module.exports = {
  'default': _default
}
