var _ = require('underscore');
var url = require('url');
var util = require('util');
var DDPClient = require('ddp');
module.exports = Client;

function Client (options) {
  var parsedUrl = url.parse(options.url);
  DDPClient.call(this, {
    host: parsedUrl.hostname,
    port: parsedUrl.port || 80,
    useSockJs: true
  });

  this.options = options;
  this.stats = options.stats;
  this._currentUser = null;
}

util.inherits(Client, DDPClient);

Client.prototype._call = Client.prototype.call;
Client.prototype.call = function () {
  var self = this;
  if(!(arguments.length && typeof arguments[0] === 'string')) {
    throw new Error('Invalid arguments for method call');
  }

  var parameters = _.toArray(arguments);
  var methodName = parameters.shift();
  if(typeof _.last(parameters) === 'function')
    var callback = parameters.pop();

  var startTime = Date.now();
  this._call(methodName, parameters, function () {
    var time = Date.now() - startTime;
    self.emit('stats', 'method-response-time', methodName, time);
    callback && callback.call(null, arguments);
  });
}

Client.prototype._subscribe = Client.prototype.subscribe;
Client.prototype.subscribe = function () {
  var self = this;
  if(!(arguments.length && typeof arguments[0] === 'string')) {
    throw new Error('Invalid arguments for subscription');
  }

  var parameters = _.toArray(arguments);
  var publicationName = parameters.shift();
  if(typeof _.last(parameters) === 'function')
    var callback = parameters.pop();

  var startTime = Date.now();
  this._subscribe(publicationName, parameters, function () {
    var time = Date.now() - startTime;
    self.emit('stats', 'pubsub-response-time', publicationName, time);
    callback && callback.call(null, arguments);
  });
}

Client.prototype.kill = function () {
  this.close();
  this.emit('disconnected');
}

Client.prototype.init = function (callback) {
  var self = this;
  self.connect(function (error) {
    var params = self._getLoginParams();
    if(error) {
      callback(error);
    } else if(params) {
      self.login(params, callback);
    } else {
      callback(error);
    }
  });
}

Client.prototype.login = function (params, callback) {
  var self = this;
  this._call('MeteorDown:login', params, function (error, user) {
    if(error) {
      var message = util.format('Login Error %s', error.message);
      error = new Error(message);
      callback(error);
    } else {
      self._currentUser = user;
      callback();
    }
  });
}

Client.prototype.user = function () {
  return this._currentUser;
}

Client.prototype.userId = function () {
  return this._currentUser && this._currentUser._id;
}

Client.prototype._getLoginParams = function () {
  var auth = this.options.auth;
  if(this.options.key && auth && auth.userIds && auth.userIds.length) {
    var userId = this._pickRandom(auth.userIds);
    return [this.options.key, {userId: userId}];
  }
};

Client.prototype._pickRandom = function (array) {
  return array[_.random(array.length-1)];
}

module.exports = Client;
