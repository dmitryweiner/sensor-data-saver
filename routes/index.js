var express = require('express');
var router = express.Router();
var SensorMeasure = require('../models/sensorMeasure');

/* GET home page. */
router.get('/', function (req, res, next) {
  SensorMeasure.find({},
    null,
    {
      sort: {'timestamp': -1},
      limit: 20
    }
  ).exec(
    function (err, measures) {
      if (err) {
        console.warn('error', err.message);
      }
      res.render('index', {measures: measures});
    });
});

module.exports = router;
