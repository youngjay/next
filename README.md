# next

next 是一个为callback风格的异步编程提供支持的工具库。在异步编程的领域[Async.js](https://github.com/caolan/async)是一个不错的类库。next和async.js的不同之处在于：next是生成函数，async是调用函数

## 一些简单的例子
```javascript
next.pipe(
  function(num, callback) { callback(null, num + 1) },
  function(num, callback) { callback(null, num + 2) }
)(1, function() {
  console.log(arguments);
});
// result: [null, 4]

next.each(
  function(num, callback) { callback(null, num + 1) }
)([1,2,3], function() {
  console.log(arguments);
});
// result: [null, [2,3,4]]