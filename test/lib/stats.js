var _ = require('underscore');
var assert = require('assert');
var Stats = require('../../lib/stats.js');

suite('Stats', function () {
  suite('constructor', function () {
    test('reset', function () {
      var mock = {};
      Stats.prototype.reset.call(mock);
      assert.deepEqual(mock, {
        data: {
          'method-response-time': {},
          'subscription-response-time': {}
        }
      });
    });
  })

  suite('tracking', function () {
    test('method-response-time', function () {
      var mock = {data: {'method-response-time': {}}};
      var r = _.random(1000);
      Stats.prototype.track.call(mock, 'method-response-time', 'x', r);
      assert.deepEqual(mock.data['method-response-time'], {'x': [r]});
    });

    test('subscription-response-time', function () {
      var mock = {data: {'subscription-response-time': {}}};
      var r = _.random(1000);
      Stats.prototype.track.call(mock, 'subscription-response-time', 'x', r);
      assert.deepEqual(mock.data['subscription-response-time'], {'x': [r]});
    });
  });

  suite('reporting', function () {
    test('without data', function () {
      var mock = {data: {
        'method-response-time': {},
        'subscription-response-time': {}
      }};
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats, [
        { type: 'method-response-time',
          summary: {total: 0, count: 0, average: 0},
          breakdown: []},
        { type: 'subscription-response-time',
          summary: {total: 0, count: 0, average: 0},
          breakdown: []}
      ]);
    });

    test('with data', function () {
      var mock = {data: {
        'method-response-time': {x: [2, 2, 11], y: [4, 6]},
        'subscription-response-time': {a: [10]}
      }};
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats, [
        { type: 'method-response-time',
          summary: {total: 25, count: 5, average: 5},
          breakdown: [
            {name: 'x', total: 15, count: 3, average: 5},
            {name: 'y', total: 10, count: 2, average: 5}
          ]},
        { type: 'subscription-response-time',
          summary: {total: 10, count: 1, average: 10},
          breakdown: [
            {name: 'a', total: 10, count: 1, average: 10}
          ]}
      ]);
    });

  })
})
