var _ = require('underscore');
var util = require('util');
var events = require('events');
var Client = require('./lib/client.js');

function MeteorDown(action) {
  this.action = action;
}

MeteorDown.prototype.run = function(options) {
  for(var i=0; i<options.concurrency; ++i) {
    this.dispatch(options);
  }
};

MeteorDown.prototype.dispatch = function(options) {
  var self = this;
  var client = new Client({
    url: options.url,
    key: options.key,
    auth: {userId: pickRandom(options.auth.userId)}
  });

  client.on('disconnected', function () {
    self.dispatch(options);
  });

  client.on('socket-error', function(error) {
    self.dispatch(options);
  });

  client.init(function (error) {
    self.action(error, client);
  });
};

function pickRandom (array) {
  return array[_.random(array.length-1)];
}

module.exports = MeteorDown;
MeteorDown.Client = Client;
