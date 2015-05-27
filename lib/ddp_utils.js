var utils = module.exports = {};
var urlParse = require('url').parse;

utils.urlToDDPOptions = function(url) {
  var parsedUrl = urlParse(url);
  var pathname = parsedUrl.pathname.substr(1);

  var isSsl = /^https/.test(parsedUrl.protocol);
  var port = parsedUrl.port;
  if(!port) {
    port = (isSsl)? 443: 80;
  }

  var ddpOptions = {
    path: pathname,
    host: parsedUrl.hostname,
    port: port,
    use_ssl: isSsl
  };

  return ddpOptions;
};