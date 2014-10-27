var _ = require('underscore');

Stats = {}

Stats.data = {
  'method': {},
  'subscription': {}
};

Stats.track = function (type, name, value) {
  if(!this.data[type][name])
    this.data[type][name] = [];
  this.data[type][name].push(value);
}

Stats.getResult = function () {
  return _.map(this.data, function (data, type) {
    var addFn = function (x, y) { return x + y };
    var breakdown = _.map(data, function (values, name) {
      return {
        name: name,
        total: values.reduce(addFn, 0),
        count: values.length
      };
    });

    _.each(breakdown, function (item) {
      item.average = Math.round(item.total/item.count) || 0;
    });

    var summary = breakdown.reduce(function (total, current) {
      return {
        total: total.total + current.total,
        count: total.count + current.count
      };
    }, {total: 0, count: 0});

    summary.average = Math.round(summary.total / summary.count) || 0;

    return {
      type: type,
      summary: summary,
      breakdown: breakdown
    }
  });
}

Stats.printResult = function () {
  _.each(this.getResult(), function (result) {
    console.log('\n%s (count: %d, response-time: %dms)', result.type, result.summary.count, result.summary.average);
    _.each(result.breakdown, function (item) {
      console.log(' - %s (count: %d, response-time: %dms)', item.name, item.count, item.average)
    })
  })
}

module.exports = Stats;
