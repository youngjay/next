next
====

use &quot;next&quot; call to flatten the callback depth 

example
```javascript
_next(function(fileName, callback) {
  fs.readFile(fileName, 'utf-8', callback);
})
// parse html file
.next(function(content, callback) {
  var srcs = [];
  content.match(rscript).forEach(function(str) {
    var i = str.indexOf('src="');
    if (i !== -1) {       
      str = str.substring(i + 5);
      str = str.substring(0, str.indexOf('"'));
      if (str !== outputFileName) {
        srcs.push(str);
      }
    }
  });
  callback(null, srcs);
})
// read js source files
.next(function(srcs, callback) {
  _next(function(src, cb) {
    console.log('read:' + src);
    fs.readFile(path.resolve(filePath, src), 'utf-8', cb);
  }).all(srcs, callback);
})
// uglify
.next(function(contents, callback) {
  console.log('compress...')
  callback(null, uglify(contents.join('')));
})
// write to dist
.next(function(distCode, callback) {
  var distFileName = path.join(filePath, outputFileName);
  fs.writeFile(distFileName, distCode, 'utf-8', function(err) {
    if (err) {
      callback(err);
    } else {
      console.log('write file:' + distFileName + ' successfully');
    }
  });
})
.resolve(fileName, function(err) {
  console.log(err);
});

use "all" to sync results
```javascript
_next(function(src, cb) {
  console.log('read:' + src);
  fs.readFile(path.resolve(filePath, src), 'utf-8', cb);
}).all(srcs, callback);
