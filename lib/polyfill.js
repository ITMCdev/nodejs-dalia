


var Object_assign = function(target) {
  'use strict';
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  target = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
};

var Array_unique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

module.exports = {
  'Object': {
    assign: Object_assign
  },
  'Array': {
    unique: Array_unique
  }
};
