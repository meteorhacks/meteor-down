var _ = require('underscore');
var assert = require('assert');
var Stats = require('../../lib/stats.js');

suite('Stats', function () {
  suite('constructor', function () {
    test('reset', function () {
      var mock = {};
      Stats.prototype.reset.call(mock);
      assert.deepEqual(mock, {data: {}});
    });
  })

  suite('tracking', function () {
    test('field-name', function () {
      var mock = {data: {'field-name': {}}};
      var r = _.random(1000);
      Stats.prototype.track.call(mock, 'field-name', 'x', r);
      assert.deepEqual(mock.data['field-name'], {'x': [r]});
    });
  });

  suite('reporting', function () {
    test('without data', function () {
      var mock = {data: {'field-name': {}}};
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats, [
        { type: 'field-name',
          summary: {total: 0, count: 0, average: 0},
          breakdown: []}
      ]);
    });

    test('with data', function () {
      var mock = {data: {'field-name': {x: [2, 2, 11], y: [4, 6]}}};
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats, [
        { type: 'field-name',
          summary: {total: 25, count: 5, average: 5},
          breakdown: [
            {name: 'x', total: 15, count: 3, average: 5},
            {name: 'y', total: 10, count: 2, average: 5}
          ]}
      ]);
    });

  })
})
