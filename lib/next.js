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

var defaultNext = function(err, index, callback, args) {
  callback(err, index, args);
};

var buildNext = function(fns) {
  if (!fns.length) {
    return defaultNext;
  }

  var head = fns[0];
  var tail = buildNext(slice.call(fns, 1));

  return function(err, index, callback, args) {
    if (err) {
      callback(err, index);
      return;
    }

    return head.apply(null, args.concat(function(err) {
      tail(err, index, callback, slice.call(arguments, 1));
    }));
  }
};

var ensureArray = function(items) {
  return Array.isArray(items) ? items : [items];
};

var getAsyncNextFns = function(o) {
  return o instanceof Async ? o.fns : Array.isArray(o) ? o : [o];
};

var getAsync = function(o) {
  return o instanceof Async ? o : new Async(Array.isArray(o) ? o : [o]);
};

var handleErrorCallback = function(callback) {
  return function(err, index, args) {
    if (err) {
      callback(err);
      return;
    }
    callback.apply(null, [null].concat(args));
  };
};

// class
var Async = function(fns) {
  this.fns = fns;
  this.doNext = buildNext(fns);
};

var p = Async.prototype;

p.next = function(fn) {
  return new Async(this.fns.concat(getAsyncNextFns(fn)));
};

p.prev = function(fn) {
  return new Async(getAsyncNextFns(fn).concat(this.fns));
};

p._forEach = function(items, callback) {
  var inError = false;
  var fn = function(err, index, args) {
    if (inError) {
      return;
    }

    if (err) {
      inError = true;
      callback(err, index);
      return;
    }

    callback(null, index, args);
  };

  var doNext = this.doNext;
  items.forEach(function(item, i) {
    doNext(null, i, fn, ensureArray(item));
  });
};

p.resolve = function() {
  var args = arguments;
  var fnPos = args.length - 1;
  if (args.length < 1 || typeof args[fnPos] !== 'function') {
    throw 'callback must be specified';
  }

  this.doNext(null, 0, handleErrorCallback(args[fnPos]), slice.call(args, 0, fnPos));
};

// p.resolveEach = function(items, callback) {
//   this._forEach(items, handleErrorCallback(callback));
// };

p._resolveAll = function(items, callback, dontExtractArgs) {
  var len = items.length;
  var results = [];

  var check = function(index, args) {
    len -= 1;
    results[index] = args;
    if (len === 0) {     
      callback(null, dontExtractArgs ? results : results.reduce(function(ret, items) {
        return ret.concat(items);
      }));
      results = null;
    }
  };

  this._forEach(items, function(err, index, args) {
    if (err) {
      callback(err, index);
    } else {
      check(index, args);
    }
  });  
};

p.reduce = function(fn) {
  var _next = getAsync(fn);
  return this.next(function(items, callback) {  
    _next._resolveAll(items, callback);
  });
};

// exports
module.exports = function() {
  return new Async(slice.call(arguments));
};


});


