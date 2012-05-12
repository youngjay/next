define(function(require, exports, module) {

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
  var tail = concat0(fns.slice(1));

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

/* @exports */
var concat = function() {
  return splitCallback(concat0(slice.call(arguments)));
};

/* @exports */
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

var Queue = function() {
  this.first = null;
  this.last = null;
};

Queue.prototype.push = function(item) {
  var o = {
    data: item
  };

  if (this.last) {
    this.last.next = o;
  } else {
    this.first = o;
  }
  this.last = o;
};

Queue.prototype.shift = function() {
  var o = this.first;
  var ret = null;

  if (o) {
    this.first = o.next;
    ret = o.data;
  }

  if (!this.first) {
    this.last = null;
  }

  return ret;
};

/* @exports */
var concurrency = function(fn, limit, drain) {
  var buffer = new Queue();
  var runnings = 0;

  var allocate = function() {
    if (runnings !== limit) {
      var args = buffer.shift();
      if (args) {
        runnings += 1;
        run(args);
      } else {        
        if (!runnings) {
          if (drain) {
            drain();
          }
        }
      }
    }
  };

  var release = function() {
    runnings -= 1;
    allocate();
  };

  var run = function(a) {
    var callback = a[a.length - 1];
    a[a.length - 1] = function() {
      release();
      callback.apply(null, arguments);
    };
    return fn.apply(null, a);
  };

  return function() {
    buffer.push(arguments);
    allocate();
  };
};

var genKeyFromFirstArg = function(x) {
  return x;
};

/* @exports */
var memoize = function(fn, genKeyFromArgs) {
  if (!genKeyFromArgs) {
    genKeyFromArgs = genKeyFromFirstArg;
  }

  var cache = {};
  var buffer = {};

  return splitCallback(function(args, callback) {
    var key = genKeyFromArgs.apply(null, args);
    if (cache[key]) {
      callback.apply(null, cache[key]);
      return;
    }

    if (buffer[key]) {
      buffer[key].push(callback);
      return;
    }

    buffer[key] = [callback];
    fn.apply(null, args.concat([function() {
      var args = cache[key] = arguments;
      buffer[key].forEach(function(cb) {
        cb.apply(null, args);
      });
      delete buffer[key];
    }]));
  });
};

/* @exports */
var rescue = function(fn, rescuer) {
  return splitCallback(function(args, callback) {
    fn.apply(null, args.concat([function(err) {
      if (err) {
        rescuer(err, callback);
      } else {
        callback.apply(null, arguments);
      }
    }]));
  });
};

exports.concat = concat;
exports.map = map;
exports.concurrency = concurrency;
exports.memoize = memoize;
exports.rescue = rescue;

});


