var _ = require('underscore');
var assert = require('assert');
var Stats = require('../../lib/stats.js');

suite('Stats', function () {
  suite('constructor', function () {
    test('reset', function () {
      var mock = {};
      Stats.prototype.reset.call(mock);
      assert.deepEqual(mock.data, {});
      assert.equal(mock.start instanceof Date, true)
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
    test('get() without fields', function () {
      var mock = {data: {}, start: new Date()};
      mock._getData = Stats.prototype._getData;
      var stats = Stats.prototype.get.call(mock);
      assert.equal(stats.start instanceof Date, true);
      assert.equal(stats.end instanceof Date, true);
    });

    test('get() with fields', function () {
      var mock = {data: {'field-name': {}}};
      mock._getData = Stats.prototype._getData;
      var stats = Stats.prototype.get.call(mock);
      assert.deepEqual(stats.data['field-name'], {
        summary: {total: 0, count: 0, average: 0},
        breakdown: []
      })
    });

    test('_getData() without values', function () {
      var mock = {data: {'field-name': {}}};
      var data = Stats.prototype._getData.call(mock);
      assert.deepEqual(data, [
        { type: 'field-name',
          summary: {total: 0, count: 0, average: 0},
          breakdown: []}
      ]);
    });

    test('_getData() with values', function () {
      var mock = {data: {'field-name': {x: [2, 2, 11], y: [4, 6]}}};
      var data = Stats.prototype._getData.call(mock);
      assert.deepEqual(data, [
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
