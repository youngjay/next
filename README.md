# next

next 是一个为callback风格的异步编程提供支持的工具库。
next和[Async.js](https://github.com/caolan/async)的不同之处在于：next是生成函数，async是调用函数

## api

### pipe([fn1], [fn2], [fnN])
生成一个函数，先调用callback1，完成之后以callback1的返回值调用callback2，以此类推。
在调用的时候如果有异常，直接跳到调用的callback

```javascript
var add2 = next.pipe(
  function(num, callback) { callback(null, num + 1) },
  function(num, callback) { callback(null, num + 2) }
);

add2(1, function() {
  console.log(arguments);
});

```

### each(fn)
调用fn到每一个入参，收集结果
```javascript
var addEach = next.each(
  function(num, callback) { callback(null, num + 1) }
);

addEach([1,2,3], function() {
  console.log(arguments);
});
// result: [null, [2,3,4]]

```

### concurrency(fn, limit, [onDrain])
生成一个函数，使得同时运行的fn不超过limit个。当所有的fn运行完毕时触发onDrain
```javascript
var throttledRunner = concurrency(function(a, callback) {
  console.log('start:' + a);
  setTimeout(function() {
    console.log('end:' + a);
    callback(a);
  }, Math.random() * 3000);
}, LIMIT, function() {
  console.log('drain');
});

for (var i = 0; i < 1000; i++) {
  throttledRunner(i, function() {});
}

```

