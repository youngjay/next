define(function(a,b,c){c.exports=a("./lib/callback-util.js")}),require("../../seajs/sea-node.js");var fs=require("fs"),path=require("path"),cw=require("../../index.js"),uglify=require("uglify-js"),fileName=process.argv[2],filePath=path.dirname(fileName),outputFileName="index-min.js",rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,run=function(){if(!fileName){console.log("调用的时候请输入文件名，例如:node compress.js js.html");return}cw.pipe(function(a,b){fs.readFile(a,"utf-8",b)},function(a,b){var c=[];a.match(rscript).forEach(function(a){var b=a.indexOf('src="');b!==-1&&(a=a.substring(b+5),a=a.substring(0,a.indexOf('"')),a!==outputFileName&&c.push(a))}),b(null,c)},cw.each(function(a,b){console.log("read:"+a),fs.readFile(path.resolve(filePath,a),"utf-8",b)}),function(a,b){console.log("compress..."),b(null,uglify(a.join("")))},function(a,b){var c=path.join(filePath,outputFileName);fs.writeFile(c,a,"utf-8",function(a){a?b(a):console.log("write file:"+c+" successfully")})})(fileName,function(){})};run()