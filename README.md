# next

next 是一个为callback风格的异步编程提供支持的工具库。
next和[Async.js](https://github.com/caolan/async)的不同之处在于：next是生成函数，async是调用函数



## 优势
### 复用性
针对函数而不是针对过程，可以对函数进行组合和连接。采用node风格的callback机制，直接可以复用系统函数。

### 扁平化callback层次
使用next.pipe(fn1, fn2, fnN)连接函数，扁平化callback层次。

### 统一的异常处理
在pipe、each、collect等方法中进行组合的函数，一旦发生异常，则会统一跳到运行时传入callback进行处理，不用重复判断每级的error。




## 一些功能示例
### [compress](https://github.com/youngjay/next/blob/master/examples/compress/compress.js)
从页面上读取script标签src -> 获取js文件内容 -> 调用uglify-js压缩 -> 写文件




## API

### pipe([fn1], [fn2], [fnN])
生成一个函数，先调用callback1，完成之后以callback1的返回值调用callback2，以此类推。
在调用的时候如果有异常，直接跳到调用的callback

```javascript
var add2 = next.pipe(
  function(num, callback) { callback(null, num + 1, num + 2) },
  function(num1, num2, callback) { callback(null, num1 + 3, num2 + 3) }
);

add2(1, function() {
  console.log(arguments);
});

// result: [null, 5, 6]
```

### each(fn)
针对数组，遍历每一个元素，调用fn。收集完结果之后返回。
```javascript
var addEach = next.each(
  function(num, callback) { callback(null, num + 1) }
);

addEach([1,2,3], function() {
  console.log(arguments);
});
// result: [null, [2,3,4]]

```

### collect(fn1, [fn2], [fnN])
生成一个函数，以当前参数调用每个fn，收集结果之后返回
```javascript
var collectAction = next.collect(
  function(num, callback) { callback(null, num + 1) },
  function(num, callback) { callback(null, num + 2) }
);

collectAction(1, function() {
  console.log(arguments);
});
// result: [null, 2,3]

```

### concurrency(fn, limit, [onDrain])
生成一个函数，使得同时运行的fn不超过limit个，超过的调用将被缓存，当有fn执行完毕之后再执行。当所有的fn调用完毕时触发onDrain
```javascript
var throttledRunner = next.concurrency(function(a, callback) {
  console.log('start:' + a);
  setTimeout(function() {
    console.log('end:' + a);
    callback(a);
  }, Math.random() * 3000);
}, 5, function() {
  console.log('drain');
});

for (var i = 0; i < 1000; i++) {
  throttledRunner(i, function() {});
}

```

### rescue(fn, rescuer)
rescuer == (err, callback) -> 
生成一个函数，当发生异常时，由rescuer捕获，而不是跳转到运行时的callback。
rescuer接受error和callback作为参数，可以选择返回到正常的分支，或者继续抛出异常。
```javascript
next.rescue(function(a, callback) {
  console.log('raise exception:' + a);
  callback(a);
}, function(err, callback) {
  console.log('rescue exception');
  callback(null, err + ' is rescued')
})('error', function() {
  console.log(arguments)
})
```


### echo()
辅助函数，直接返回参数
```javascript
next.echo([1,2,3], function() {
  console.log(arguments);
});
// result: [null, [1,2,3]]

```

在collect的时候，使用echo可以返回原参数

```javascript
var collectAction = next.collect(
  next.echo,
  function(num, callback) { callback(null, num + 1) },
  function(num, callback) { callback(null, num + 2) }
);

collectAction(1, function() {
  console.log(arguments);
});
// result: [null, [1,2,3]]

```


