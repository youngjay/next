next
====

a tiny library for async programing

advantage:
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


### resolve

use "resolve" to run single task

```javascript
next(function(a, callback) {
  callback(null, a + 1);
})
.resolve(1, function(err) {
  console.log(arguments);
});
```

### forEach

use "forEach" to run multiple tasks

```javascript
next(function(a, callback) {
  callback(null, a + 1);
})
.forEach([1,2,3], function(err) {
  console.log(arguments);
});
```

### all

use "all" to sync results

```javascript
next(function(src, cb) {
  console.log('read:' + src);
  fs.readFile(path.resolve(filePath, src), 'utf-8', cb);
}).all(srcs, callback);
```