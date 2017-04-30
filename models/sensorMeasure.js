var mongoose = require('mongoose');
var config = require('../config');
var Schema = mongoose.Schema;

module.exports = mongoose.model('SensorMeasure', new Schema({
  sensor: {type: String, index: true},
  temperature: Number,
  humidity: Number,
  pressure: Number,
  timestamp: {type: Date, default: Date.now}
}, {
  capped: config.maxMeasuresDbStorage
}));