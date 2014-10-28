var _ = require('underscore');
var util = require('util');
var events = require('events');
var Client = require('./client.js');
var Stats = require('./stats.js');

function MeteorDown() {
  this.action = Function.prototype;
  this.stats = new Stats();
}

MeteorDown.prototype.init = function(action) {
  this.action = action;
}

MeteorDown.prototype.run = function(options) {
  options = _.extend(this._defaultOptions(), options);
  for(var i=0; i<options.concurrency; ++i) {
    this._dispatch(options);
  }
};

MeteorDown.prototype._defaultOptions = function () {
  return {
    concurrency: 10,
    url: 'http://localhost:3000'
  };
}

MeteorDown.prototype._dispatch = function(options) {
  var self = this;
  var client = new Client(options);

  client.on('disconnected', function () {
    self._dispatch(options);
  });

  client.on('socket-error', function(error) {
    self._dispatch(options);
  });

  client.on('stats', function(type, name, value) {
    self.stats.track(type, name, value);
  });

  client.init(function (error) {
    if(error) throw error;
    self.action(client);
  });
};

module.exports = MeteorDown;
