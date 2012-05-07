(function(factory) {

// node
if (typeof require !== 'undefined') {
  factory(require, exports, module);
  return;
}

// seajs
if (typeof define !== 'undefined') {
  define(factory);
  return;
}

// window
var _module = {
  exports: {}
};

factory(null, _module.exports, _module);

window['next'] = _module.exports;

})(function(require, exports, module) {

// Array.prototype.forEach is required 

var slice = [].slice;
var noop = function() {};

var splitCallback = function(fn) {
  return function() {
    var a = arguments;
    return fn(slice.call(a, 0, a.length - 1), a[a.length - 1]);
  }
};

var invokeCallback = function(args, callback) {
  callback.apply(null, [null].concat(args));
};

var concat0 = function(fns) {
  if (!fns.length) {
    return invokeCallback;
  }

  var head = fns[0];
  var tail = concat0(slice.call(fns, 1));

  return function(args, callback) {
    head.apply(null, args.concat([function(err) {
      if (err) {
        callback(err);
      } else {
        tail(slice.call(arguments, 1), callback);
      }
    }]));
  };
};

var concat = function() {
  var mergedFns = concat0(arguments);
  return splitCallback(function(args, callback) {
    mergedFns(args, callback);
  });
};

var map = function(fn) {
  return function(items, callback) {
    var len = items.length;
    var results = [];

    var check = function(index, args) {
      if (!results[index]) {
        len -= 1;
        results[index] = args;
        if (len === 0) {     
          callback(null, results.reduce(function(ret, items) {
            return ret.concat(items);
          }));
          results = null;
          check = noop;
        }
      }
    };

    var isError = false;
    items.forEach(function(item, i) {
      fn(item, function(err) {
        if (isError) {
          return;
        }
        if (err) {
          callback(err);
          isError = true;
          return;
        }
        check(i, slice.call(arguments, 1));
      })
    });
  };
};


exports.concat = concat;
exports.map = map;


});


