define(function(require) {

var wrap = require('../index.js');
var util = wrap.util;

var concat = util.concat;
var map = util.map;
var concurrency = util.concurrency;
var memoize = util.memoize;
var rescue = util.rescue;
// var task = util.task;

// test tool
var add = function(a, callback) {
  callback(null, a + 1);
};

var mul = function(a, callback) {
  callback(null, a * 2);
};

concat(
  function(callback) {
    console.log('test map');

    map(add)([3, 4], function() {
      console.log(arguments)
    });

    callback();
  },

  function(callback) {
    console.log('test rescue');

    rescue(function(a, callback) {
      console.log('raise exception:' + a);
      callback(a);
    }, function(err, callback) {
      console.log('rescue exception');
      callback(null, err + ' is rescued')
    })('error', function() {
      console.log(arguments)
    })

    callback()
  },


  // function(callback) {
  //   console.log('test task');
    
  //   var tadd = task(add);
  //   var tmul = task(function(a, b, callback) {
  //     callback(null, a * b)
  //   });

  //   aReadFile = task(fs.readFile);

  //   var tFile = aReadFile('./a.txt', 'utf-8');
    


  //   tmul(tadd(1), 3).callback(function() {
  //     console.log(arguments)
  //   })


  //   callback()
  // },


  function(callback) {
    console.log('test memoize');

    var fn = memoize(function(a, b, callback) {
      console.log('new call with arg:' + a + ', ' + b);
      callback(null, a, b);
    });

    fn(2, {hello: 'world'}, function(err, a, b) {
      console.log('call with arg:' + a + ', ' + b);
    });

    fn(2, {hello: 'world'}, function(err, a, b) {
      console.log('call with arg:' + a + ', ' + b);
    });

    fn(3, {hello: 'world'}, function(err, a, b) {
      console.log('call with arg:' + a + ', ' + b);
    });


    fn(3, 'a', function(err, a, b) {
      console.log('call with arg:' + a + ', ' + b);
    });

    callback();
  },

  function(callback) {
    var TASK_COUNT = 10;
    var LIMIT = 3;

    console.log('test concurrency:LIMIT=' + LIMIT + ', TASK_COUNT=' + TASK_COUNT);

    var fn = concurrency(function(a, callback) {
      console.log('start:' + a);
      setTimeout(function() {
        console.log('end:' + a);
        callback(a);
      }, Math.random() * 3000);
    }, LIMIT, function() {
      console.log('drain');
    });

    var completeNum = 0;
    for (var i = 0; i < TASK_COUNT; i++) {
      fn(i, function(a) {
        completeNum += 1;
      })
    };

    var timer = setInterval(function() {
      if (completeNum === TASK_COUNT) {
        clearInterval(timer);
        callback();
      }
    }, 1000);
  },
  // finish
  function() {
    console.log('All tests completed successfully')
  }
)(function(err) {
  console.log(err);
});




})