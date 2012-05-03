next
====

a tiny library for async programing

advantages:
---
* less methods
* node style callback, args use "err" in first position


usage:
---

### `next`

use &quot;next&quot; call to flatten the callback depth 

```javascript
next(function(a, callback) {
  callback(null, a + 1);
})
.next(function(a, callback) {
  callback(null, a + 2);
})
.resolve(1, function(err) {
  console.log(arguments);
});
```
output: [null, 4]


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
  callback(null, a + 1);
})
.forEach([1,2,3], function(err) {
  console.log(arguments);
});
```
output: [null, 2]
output: [null, 3]
output: [null, 4]


### `all`

use "all" to sync results

```javascript
next(function(a, callback) {
  callback(null, a + 1);
})
.all([1,2,3], function(err) {
  console.log(arguments);
});
```
output: [null, [2,3,4]]