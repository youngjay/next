define(function(require, exports, module) {
// ECMAScript5 is required 

var slice = [].slice;
var reduce = [].reduce;
var forEach = [].forEach;
var noop = function() {};

var splitCallback = function(fn) {
  return function() {
    var a = arguments;
    return fn(slice.call(a, 0, a.length - 1), a[a.length - 1]);
  }
};

var dissect = function(handleArgs, handleResults) {
  return splitCallback(function(args, callback) {
    handleArgs.apply(null, args.concat([function() {
      handleResults(callback, arguments, args);
    }]));
  });
};

var dissectAutoHandleError = function(handleArgs, handleResults) {
  return dissect(handleArgs, function(callback, args) {
    var err = args[0];
    if (err) {
      callback(err);
    } else {
      handleResults(callback, slice.call(args, 1));
    }
  });
};


/***************************** echo *****************************/
var echo = splitCallback(function(args, callback) {
  callback.apply(null, [null].concat(args));
});

/***************************** pipe *****************************/
var pipe0 = function(prev, next) {
  return dissectAutoHandleError(prev, function(callback, args) {
    next.apply(null, args.concat([callback]));
  });
};

var pipe = function() {
  return reduce.call(arguments, pipe0);
};


/***************************** each *****************************/
var each = function(mapper) {
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
    forEach.call(items, function(item, i) {
      mapper(item, function(err) {
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

/***************************** collect *****************************/
var collect = function() {
  var fns = slice.call(arguments);
  return splitCallback(function(args, callback) {
    each(function(fn, cb) {
      fn.apply(null, args.concat([cb]));
    })(fns, callback);
  });
};

/***************************** concurrency *****************************/
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

var concurrency = function(fn, limit, onDrain) {
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

/***************************** memoize *****************************/
var genKeyFromFirstArg = function(x) {
  return x;
};

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

/***************************** rescue *****************************/
var rescue = function(fn, rescuer) {
  return dissect(fn, function(callback, args) {
    var err = args[0];
    if (err) {
      rescuer(err, callback);
    } else {
      callback.apply(null, args);
    }
  });
};

module.exports = {
  echo: echo,
  pipe: pipe,
  each: each,
  collect: collect,
  concurrency: concurrency,
  memoize: memoize,
  rescue: rescue
};

});


