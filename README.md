next
====

a tiny library for async programing

advantages:
---
* less methods
* node style callback, args use "err" in first position, can embed with node native methods easily

api:
---

### `resolve`

use resolve(arg1, arg2...argN, callback) to start task with args

```javascript
next(function(a, callback) {
  callback(null, a + 1);
})
.resolve(1, function(err) {
  console.log(arguments);
});
```
output: [null, 2]


### `next`

use next(fn_or_another_next) to invoke muliple handlers sequentially

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

### `reduce`

use reduce(fn_or_another_next) to map reduce items

```javascript
next()
.reduce(function(a, callback) {
  callback(null, a + 1);
})
.resolve([3,2,1], function(err) {
  console.log(arguments);
});
```
output: [null, [4,3,2]]

examples:
---
[compress js](https://github.com/youngjay/next/blob/master/examples/compress/compress.js)