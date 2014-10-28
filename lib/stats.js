var _ = require('underscore');

function Stats () {
  this.data = {
    'method': {},
    'subscription': {}
  };
}

Stats.prototype.track = function (type, name, value) {
  if(!this.data[type][name])
    this.data[type][name] = [];
  this.data[type][name].push(value);
}

Stats.prototype.get = function () {
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

module.exports = Stats;
