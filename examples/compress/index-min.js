define(function(a,b,c){var d=[].slice,e=function(){},f=function(a,b,c,d){c(a,b,d)},g=function(a){if(!a.length)return f;var b=a[0],c=g(d.call(a,1));return function(a,e,f,g){if(a){f(a,e);return}return b.apply(null,g.concat(function(a){c(a,e,f,d.call(arguments,1))}))}},h=function(a){return Array.isArray(a)?a:[a]},i=function(a){return a instanceof k?a.fns:Array.isArray(a)?a:[a]},j=function(a){return a||(a=e),function(b,c,d){if(b){a(b);return}a.apply(null,[null].concat(d))}},k=function(a){this.fns=a,this.doNext=g(a)},l=k.prototype;l.next=function(a){return new k(this.fns.concat(i(a)))},l.prev=function(a){return new k(i(a).concat(this.fns))},l.resolve=function(a,b){this.doNext(null,0,j(b),h(a))},l._forEach=function(a,b){var c=!1,d=function(a,d,e){if(c)return;if(a){c=!0,b(a,d);return}b(null,d,e)},e=this.doNext;a.forEach(function(a,b){e(null,b,d,h(a))})},l.forEach=function(a,b){this._forEach(a,j(b))},l.all=function(a,b,c){var d=a.length,e=[],f=function(a,f){d-=1,e[a]=f,d===0&&(b(null,c?e:e.reduce(function(a,b){return a.concat(b)})),e=null)};this._forEach(a,function(a,c,d){a?b(a,c):f(c,d)})},c.exports=function(a){return new k([a])}});var fs=require("fs"),path=require("path");require("seajs");var _next=require("next"),uglify=require("uglify-js"),fileName=process.argv[2],filePath=path.dirname(fileName),outputFileName="index-min.js",rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,run=function(){if(!fileName){console.log("调用的时候请输入文件名，例如:node compress.js js.html");return}_next(function(a,b){fs.readFile(a,"utf-8",b)}).next(function(a,b){var c=[];a.match(rscript).forEach(function(a){var b=a.indexOf('src="');b!==-1&&(a=a.substring(b+5),a=a.substring(0,a.indexOf('"')),a!==outputFileName&&c.push(a))}),b(null,c)}).next(function(a,b){_next(function(a,b){console.log("read:"+a),fs.readFile(path.resolve(filePath,a),"utf-8",b)}).all(a,b)}).next(function(a,b){console.log("compress..."),b(null,uglify(a.join("")))}).next(function(a,b){var c=path.join(filePath,outputFileName);fs.writeFile(c,a,"utf-8",function(a){a?b(a):console.log("write file:"+c+" successfully")})}).resolve(fileName,function(a){console.log(a)})};run()