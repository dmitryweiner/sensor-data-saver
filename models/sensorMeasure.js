var mongoose = require('mongoose');
var config = require('../config');
var Schema = mongoose.Schema;

module.exports = mongoose.model('SensorMeasure', new Schema({
  sensorId: {type: mongoose.Schema.Types.ObjectId, ref: 'Sensor'},
  parameters: [
    {
      type: { type: String },
      value: String
    }
  ],
  timestamp: { type: Date, default: Date.now }
}, {
  capped: { size: config.maxMeasuresDbStorage, autoIndexId: true }
}));
