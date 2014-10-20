var _ = require('underscore');
var url = require('url');
var util = require('util');
var DDPClient = require('ddp');
module.exports = Client;

function Client (options) {
  var parsedUrl = url.parse(options.url);
  DDPClient.call(this, {
    host: parsedUrl.hostname,
    port: parsedUrl.port || 80
  });

  this.options = options;
  this._currentUser = null;
}

util.inherits(Client, DDPClient);

Client.prototype._call = Client.prototype.call;
Client.prototype.call = function () {
  // TODO validate arguments
  var parameters = _.toArray(arguments);
  var methodName = parameters.shift();
  if(typeof _.last(parameters) === 'function')
    var callback = parameters.pop();
  callback = callback || Function.prototype;
  this._call(methodName, parameters, callback);
}

Client.prototype._subscribe = Client.prototype.subscribe;
Client.prototype.subscribe = function () {
  // TODO validate arguments
  var parameters = _.toArray(arguments);
  var publicationName = parameters.shift();
  if(typeof _.last(parameters) === 'function')
    var callback = parameters.pop();
  callback = callback || Function.prototype;
  this._subscribe(publicationName, parameters, callback);
}

Client.prototype.kill = function () {
  this.close();
  this.emit('disconnected');
}

Client.prototype.init = function (callback) {
  var self = this;
  callback = callback || Function.prototype;
  self.connect(function (error) {
    var key = self.options.key, params = self.options.auth;
    self.call('MeteorDown:login', key, params, function (error, user) {
      self._currentUser = user;
      callback(error);
    });
  });
}

Client.prototype.user = function () {
  return this._currentUser;
}

Client.prototype.userId = function () {
  return this._currentUser && this._currentUser._id;
}

module.exports = Client;
