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
  
// ECMAScript5 is required 

var slice = [].slice;
var arrayForEach = [].forEach;
var arrayMap = [].map;
var noop = function() {};

// Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
var applyFn = function(fn, args) {
  switch (args.length) {
    case  0: return fn();
    case  1: return fn(args[0]);
    case  2: return fn(args[0], args[1]);
    case  3: return fn(args[0], args[1], args[2]);
    case  4: return fn(args[0], args[1], args[2], args[3]);
    case  5: return fn(args[0], args[1], args[2], args[3], args[4]);
    case  6: return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
    case  7: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    case  8: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
    case  9: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
    case 10: return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
    default: return fn.apply(null, args);
  }
};

var detachCallback = function(fn) {
  return function() {
    var a = arguments;
    return fn(slice.call(a, 0, a.length - 1), a[a.length - 1]);
  }
};

var dissect = function(handleArgs, handleResults) {
  return detachCallback(function(args, callback) {
    applyFn(handleArgs, args.concat([function(err) {
      handleResults(callback, err, arguments, args);
    }]));
  });
};

var extract = function(args, callback) {
  applyFn(callback, [null].concat(args));
};

var map0 = function(items, fn, callback) {
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
  arrayForEach.call(items, function(item, i) {
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

var normalizeCallback = function(fn) {
  return typeof fn === 'function' ? fn : detachCallback(function(args, callback) {
    callback(null, fn);
  });
};

var normalizeCallbacks = function(fns) {
  return arrayMap.call(fns, normalizeCallback);
};

var reduceArgs = function(fn) {
  return function() {
    return arguments.length ? normalizeCallbacks(arguments).reduce(fn) : echo;
  }
};

var echo = detachCallback(extract);

var pipe = reduceArgs(function(prev, next) {
  return dissect(prev, function(callback, err, args, lastArgs) {
    if (err) {
      callback(err);
    } else {
      applyFn(next, slice.call(args, 1).concat([callback]));
    }
  });
});

var series = reduceArgs(function(prev, next) {
  return dissect(prev, function(callback, err, args, lastArgs) {
    if (err) {
      callback(err);
    } else {
      applyFn(next, lastArgs.concat([callback]));
    }
  });
});

var attempt = reduceArgs(function(prev, next) {
  return dissect(prev, function(callback, err, args, lastArgs) {
    if (err) {
      applyFn(next, lastArgs.concat([callback]));
    } else {
      applyFn(callback, args);
    }
  });
});

var map = function(fn) {
  return detachCallback(function(args, callback) {
    var items = args[0];
    var extraArgs = args.slice(1);
    return map0(items, extraArgs.length ? detachCallback(function(itemArgs, cb) {
      applyFn(fn, itemArgs.concat(extraArgs, [cb]));
    }) : fn, callback);
  })
};

var parallel = function() {
  var fns = normalizeCallbacks(arguments);
  return pipe(
    detachCallback(function(args, callback) {
      map0(fns, function(fn, cb) {
        applyFn(fn, args.concat([cb]));
      }, callback);
    }),
    extract
  );
};

var concurrency = function(fn, limit, onDrain) {
  var buffer = [];
  var runnings = 0;

  var allocate = function() {
    if (runnings !== limit) {
      var args = buffer.shift();
      if (args) {
        runnings += 1;
        run(args);
      } else {        
        if (!runnings) {
          if (onDrain) {
            onDrain();
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
    return applyFn(fn, slice.call(a, 0, a.length - 1).concat([function() {
      release();
      applyFn(callback, arguments);
    }]));
  };

  return function() {
    buffer.push(arguments);
    allocate();
  };
};

var genKeyFromFirstArg = function(x) {
  return x;
};

var memoize = function(fn, genKeyFromArgs) {
  if (!genKeyFromArgs) {
    genKeyFromArgs = genKeyFromFirstArg;
  }

  var cache = {};
  var buffer = {};

  return detachCallback(function(args, callback) {
    var key = applyFn(genKeyFromArgs, args);
    if (cache[key]) {
      applyFn(callback, cache[key]);
      return;
    }

    if (buffer[key]) {
      buffer[key].push(callback);
      return;
    }

    buffer[key] = [callback];
    applyFn(fn, args.concat([function() {
      var args = cache[key] = arguments;
      buffer[key].forEach(function(cb) {
        applyFn(cb, args);
      });
      delete buffer[key];
    }]));
  });
};

module.exports = {
  pipe: pipe,
  attempt: attempt,
  map: map,
  series: series,
  parallel: parallel,
  concurrency: concurrency,
  memoize: memoize,
  callback: {
    map: map0,
    extract: extract,
    echo: echo
  }
};

});


