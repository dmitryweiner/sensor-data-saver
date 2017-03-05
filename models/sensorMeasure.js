var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('SensorMeasure', new Schema({
  temperature: Number,
  humidity: Number,
  pressure: Number,
  timestamp: {type: Date, default: Date.now }
}));