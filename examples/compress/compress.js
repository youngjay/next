/*

useage:
node compress.js /home/path/to/src.html

output:
/home/path/to/index-min.js

process: input a html file
1  find the "<script>" tags
2  read the script src when availible.
3  combine them and use "uglify-js" to compress them into one file
4  write it into srcPath/outputFileName

*/
var fs = require('fs');
var path = require('path');
require('seajs');
var _next = require('next');
var uglify = require('uglify-js');

var fileName = process.argv[2];
var filePath = path.dirname(fileName);
var outputFileName = 'index-min.js';
var rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;


var run = function() {
	if (!fileName) {
		console.log('调用的时候请输入文件名，例如:node compress.js js.html')
		return;
	}

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
};

run();

