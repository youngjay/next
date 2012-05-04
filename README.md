next
====

a tiny library for async programing

advantages:
---
* less methods
* node style callback, args use "err" in first position, can embed with node native methods easily

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

### `resolveEach`

use "resolveEach" to run multiple tasks

```javascript
next(function(a, callback) {
  setTimeout(function() {
    callback(null, a + 1);
  }, a * 10);  
})
.resolveEach([3,2,1], function(err) {
  console.log(arguments);
});
```
output: 

[null, 2]

[null, 3]

[null, 4]


### `resolveAll`

use "resolveAll" to sync results, next will take care of the input items order

```javascript
next(function(a, callback) {
  setTimeout(function() {
    callback(null, a + 1);
  }, a * 10);  
})
.resolveAll([3,2,1], function(err) {
  console.log(arguments);
});
```
output: [null, [4,3,2]]

examples:
---
[compress js](https://github.com/youngjay/next/blob/master/examples/compress/compress.js)