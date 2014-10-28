var _ = require('underscore');
var assert = require('assert');
var MeteorDown = require('../../lib/mdown.js');

suite('MeteorDown', function () {
  test('constructor', function () {
    var mock = {};
    MeteorDown.call(mock);
    assert.equal(typeof mock.action, 'function');
    assert.equal(typeof mock.stats, 'object');
  })
})
