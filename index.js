define(function(require, _, module) {

var util = require('./lib/callback-util');
var wrap = require('./lib/task-wrap');

var exports = module.exports = wrap;
exports.util = util;


});