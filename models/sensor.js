var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Sensor', new Schema({
  name: String,
  description: String
}));