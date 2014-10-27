var assert = require('assert');
var Client = require('../lib/client.js');

suite('Client', function () {
  suite('validate arguments', function () {

    test('Client.prototype.call()', function () {
      var mock = {_call: Function.prototype};
      assert.throws(function () {
        Client.prototype.call.call(mock);
      });
      assert.doesNotThrow(function () {
        Client.prototype.call.call(mock, 'method-name');
      });
    })

    test('Client.prototype.subscribe()', function () {
      var mock = {_subscribe: Function.prototype};
      assert.throws(function () {
        Client.prototype.subscribe.call(mock);
      });
      assert.doesNotThrow(function () {
        Client.prototype.subscribe.call(mock, 'method-name');
      });
    })

  })
})
