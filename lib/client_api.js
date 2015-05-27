var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

ClientApi = module.exports = function ClientApi(client) {
  var self = this;
  this._client = client;
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
  this._client.connect(function (error) {
    if(error) {
      callback(error);
    } else {
      callback(null);
    }
  });
};