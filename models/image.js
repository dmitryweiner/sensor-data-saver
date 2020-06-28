var mongoose = require('mongoose');
var config = require('../config');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Image', new Schema({
    measureId: {type: mongoose.Schema.Types.ObjectId, ref: 'SensorMeasure'},
    content: Buffer
}, {
  capped: config.maxStorageSize.images
}));
