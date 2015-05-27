var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

ClientApi = module.exports = function ClientApi(client, options) {
  var self = this;
  this._client = client;
  this._options = options;
  this._client.once('socket-error', function() {
    self.emit('disconnected');
  });
};

util.inherits(ClientApi, EventEmitter);

ClientApi.prototype.call = function(methodName) {
  var self = this;
  var args = _.toArray(arguments).slice(1);
  var callback = function() {};
  if(typeof _.last(args) === "function") {
    callback = _.last(args);
    args = _.initial(args);
  }

  var startTime = Date.now();
  this._client.call(methodName, args, function(err, res) {
    callback(err, res);
    var resTime = Date.now() - startTime;
    self.emit('stats', 'method-response-time', methodName, resTime);
  });
};

ClientApi.prototype.subscribe = function(subName) {
  var self = this;
  var args = _.toArray(arguments).slice(1);
  var callbacks = {
    onReady: function() {},
    onStop: function() {}
  };

  var lastArg = _.last(args);
  if(typeof lastArg === "function") {
    callbacks.onReady = lastArg;
    args = _.initial(args);
  } else if(typeof lastArg === "object") {
    _.extend(callbacks, lastArg);
    args = _.initial(args);
  }

  var startTime = Date.now();
  var completeTrackTime = _.once(function() {
    var resTime = Date.now() - startTime;
    self.emit('stats', 'pubsub-response-time', subName, resTime);
  });

  var subId = self._client.subscribe(subName, args);
  self._client.on("message", watchSubscription);

  function watchSubscription(message) {
    var message = JSON.parse(message);
    if(!message.subs || message.subs.indexOf(subId) < 0) {
      return;
    }
    
    completeTrackTime();

    if(message.msg === "ready") {
      return callbacks.onReady();
    }

    if(message.msg === "nosub") {
      var error = null;
      if(message.error) {
        error = message.error;
      }
      callbacks.onStop(error);
      return self._client.removeListener(watchSubscription);
    }
  }

  var handler = {
    stop: function() {
      self.unsubscribe(subId);
    }
  };

  return handler;
};

ClientApi.prototype.getCollectionData = function(collectioName) {
  return this._client.collection(collectioName);
};

ClientApi.prototype.kill = function() {
  this._client.close();
  this.emit('disconnected');
};

ClientApi.prototype.init = function(callback) {
  var self = this;
  this._client.connect(function (error) {
    var loginParams = self._getLoginParams();
    if(error) {
      callback(error);
    } else if(loginParams) {
      this._login(loginParams, callback);
    } else {
      callback(null);
    }
  });
};

ClientApi.prototype.user = function () {
  return this._currentUser;
};

ClientApi.prototype.userId = function () {
  return this._currentUser && this._currentUser._id;
};

ClientApi.prototype._login = function (params, callback) {
  var self = this;
  var params = ['MeteorDown:login'];
  params = params.connect(params);
  params.push(handleResponse);

  function handleResponse(error, user) {
    if(error) {
      var message = util.format('Login Error %s', error.message);
      error = new Error(message);
      callback(error);
    } else {
      self._currentUser = user;
      callback();
    }
  }

  this.call.apply(this, params);
};

ClientApi.prototype._getLoginParams = function () {
  var auth = this._options.auth;
  var key = this._options.key;
  if(key && auth && auth.userIds && auth.userIds.length) {
    var userId = this._pickRandom(auth.userIds);
    return [key, {userId: userId}];
  }
};

ClientApi.prototype._pickRandom = function (array) {
  return array[_.random(array.length-1)];
};