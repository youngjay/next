next
====

a tiny library for async programing

advantages:
---
* less methods
* node style callback, args use "err" in first position

dependencies:
---
next.js uses [seajs](https://github.com/seajs/seajs). If you dont't like it, just comment the first line and the last line
```javascript
define(function(require, exports, module) {
  // comment lines above and below 
});
```

You can also use it in web with a small change.
```javascript
// replace
module.exports = function(fn) {
  return new Async([fn]);
};

// with
window.next = function(fn) {
  return new Async([fn]);
};

```


usage:
---

### `next`

use &quot;next&quot; call to flatten the callback depth 

```javascript
next(function(a, callback) {
  callback(null, a + 2);
})
.next(function(a, callback) {
  callback(null, a + 2);
})
.next(function(a, callback) {
  callback(null, a + 2);
})
.next(function(a, callback) {
  callback(null, a + 2);
})
.resolve(1, function(err) {
  console.log(arguments);
});
```
output: [null, 9]


### `resolve`

use "resolve" to run single task

```javascript
next(function(a, callback) {
  callback(null, a + 1);
})
.resolve(1, function(err) {
  console.log(arguments);
});
```

### `forEach`

use "forEach" to run multiple tasks

```javascript
next(function(a, callback) {
  setTimeout(function() {
    callback(null, a + 1);
  }, a * 10);  
})
.forEach([3,2,1], function(err) {
  console.log(arguments);
});
```
output: 

[null, 2]

[null, 3]

[null, 4]


### `all`

use "all" to sync results, next will take care of the input items order

```javascript
next(function(a, callback) {
  setTimeout(function() {
    callback(null, a + 1);
  }, a * 10);  
})
.all([3,2,1], function(err) {
  console.log(arguments);
});
```
output: [null, [4,3,2]]

examples:
---
[compress js](https://github.com/youngjay/next/blob/master/examples/compress/compress.js)