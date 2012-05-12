define(function(require, exports, module) {

var cu = require('./callback-util.js');
var map = cu.map;

var mapTaskArgs = map(function(o, callback) {
  if (o instanceof Task) {
    o.callback(callback);
  } else {
    callback(null, o);
  }
});

var Task = function(fn, args) {
  var callbacks = this.callbacks = [];
  var _this = this;

  var handleComplete = function() {
    var retArgs = _this.retArgs = arguments;
    callbacks.forEach(function(callback) {
      callback.apply(null, retArgs);
    });
    callbacks.length = 0;
    callbacks = null;
  };

  mapTaskArgs(args, function(err, results) {
    if (err) {
      handleComplete(err);
    } else {
      fn.apply(null, results.concat([handleComplete]));
    }
  });
};

(function(p) {

p.callback = function(callback) {
  if (this.retArgs) {
    callback.apply(null, this.retArgs);
  } else {
    this.callbacks.push(callback);
  }
};


})(Task.prototype);


var wrapCallback = function(fn) {
  return function() {
    return new Task(fn, slice.call(arguments));
  };
};

exports.wrapCallback = wrapCallback;

});