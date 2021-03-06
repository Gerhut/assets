var encodeBuffer = require('./__utils__/encodeBuffer');
var extend = require('lodash/extend');
var fs = require('fs');
var mime = require('mime');
var Promise = require('bluebird');
var resolvePath = require('./path');
var url = require('url');
var imagemin = (function (r) {
  try {
    return r('imagemin');
  } catch (e) {
    return null;
  }
}(require));


var preadFile = Promise.promisify(fs.readFile);

module.exports = function (to, options, callback) {
  var toUrl;

  /* eslint-disable no-param-reassign */

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = extend({
    basePath: '.',
    loadPaths: []
  }, options);

  /* eslint-enable */

  toUrl = url.parse(to);

  return resolvePath(toUrl.pathname, options)
    .then(function (resolvedPath) {
      var mediaType = mime.lookup(resolvedPath);
      return preadFile(resolvedPath)
        .then(function (buffer) {
          if (options.imagemin == null || imagemin == null) return buffer;
          return imagemin.buffer(buffer, options.imagemin);
        })
        .then(function (buffer) {
          var content = encodeBuffer(buffer, mediaType);
          return 'data:' + mediaType + ';' + content + (toUrl.hash || '');
        });
    })
    .nodeify(callback);
};
