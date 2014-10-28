var _ = require('underscore');
var assert = require('assert');
var Stats = require('../../lib/stats.js');

suite('Stats', function () {
  test('constructor', function () {
    var mock = {};
    Stats.call(mock);
    assert.deepEqual(mock, {data: {'method': {}, 'subscription': {}}});
  })

  suite('tracking', function () {
    test('method', function () {
      var mock = {data: {'method': {}}};
      var rand = _.random(1000);
      Stats.prototype.track.call(mock, 'method', 'x', rand);
      assert.deepEqual(mock.data.method, {'x': [rand]});
    });

    test('subscription', function () {
      var mock = {data: {'subscription': {}}};
      var rand = _.random(1000);
      Stats.prototype.track.call(mock, 'subscription', 'x', rand);
      assert.deepEqual(mock.data.subscription, {'x': [rand]});
    });
  });

  suite('reporting', function () {
    test('without data', function () {
      var mock = {data: {'method': {}, 'subscription': {}}};
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats, [
        { type: 'method',
          summary: {total: 0, count: 0, average: 0},
          breakdown: []},
        { type: 'subscription',
          summary: {total: 0, count: 0, average: 0},
          breakdown: []}
      ]);
    });

    test('with data', function () {
      var mock = {data: {
        'method': {x: [2, 2, 11], y: [4, 6]},
        'subscription': {a: [10]}
      }};
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats, [
        { type: 'method',
          summary: {total: 25, count: 5, average: 5},
          breakdown: [
            {name: 'x', total: 15, count: 3, average: 5},
            {name: 'y', total: 10, count: 2, average: 5}
          ]},
        { type: 'subscription',
          summary: {total: 10, count: 1, average: 10},
          breakdown: [
            {name: 'a', total: 10, count: 1, average: 10}
          ]}
      ]);
    });

  })
})
