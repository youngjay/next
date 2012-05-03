define(function(require, exports, module) {

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

var getAsyncNexts = function(fn) {
  return fn instanceof Async ? fn.fns : Array.isArray(fn) ? fn : [fn];
};

var handleErrorCallback = function(callback) {
  if (!callback) {
    callback = noop;
  }
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
  return new Async(this.fns.concat(getAsyncNexts(fn)));
};

p.prev = function(fn) {
  return new Async(getAsyncNexts(fn).concat(this.fns));
};

p.resolve = function(args, callback) {
  this.doNext(null, 0, handleErrorCallback(callback), ensureArray(args));
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

p.forEach = function(items, callback) {
  this._forEach(items, handleErrorCallback(callback));
};

p.all = function(items, callback, dontExtractArgs) {
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

// exports
module.exports = function(fn) {
  return new Async([fn]);
};

});


