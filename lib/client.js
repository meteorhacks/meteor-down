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
  if(!(arguments.length && typeof arguments[0] === 'string')) {
    throw new Error('Invalid arguments for method call');
  }
  var parameters = _.toArray(arguments);
  var methodName = parameters.shift();
  if(typeof _.last(parameters) === 'function')
    var callback = parameters.pop();
  callback = callback || Function.prototype;
  this._call(methodName, parameters, callback);
}

Client.prototype._subscribe = Client.prototype.subscribe;
Client.prototype.subscribe = function () {
  if(!(arguments.length && typeof arguments[0] === 'string')) {
    throw new Error('Invalid arguments for subscription');
  }
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
  self.connect(function (error) {
    if(error) {
      callback(error);
    } else if(self.options.key && self.options.auth) {
      self._login(callback);
    } else {
      callback(error);
    }
  });
}

Client.prototype._login = function (callback) {
  var self = this;
  var key = self.options.key;
  var auth = self.options.auth;
  self.call('MeteorDown:login', key, auth, function (error, user) {
    self._currentUser = user;
    callback(error);
  });
};

Client.prototype.user = function () {
  return this._currentUser;
}

Client.prototype.userId = function () {
  return this._currentUser && this._currentUser._id;
}

module.exports = Client;
