var express = require('express');
var router = express.Router();
var SensorMeasure = require('../models/sensorMeasure');
var Sensor = require('../models/sensor');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/measures/:sensor', function (req, res, next) {
  var request, limit = 0;

  if (typeof req.query.limit != 'undefined'){
    limit = req.query.limit;
  } else {
    limit = 100;
  }

  if (typeof req.query.from != 'undefined' && req.query.from &&
    typeof req.query.to != 'undefined' && req.query.to
  ) {
    request = {
      $and: [
        {timestamp: {$gt: req.query.from}},
        {timestamp: {$lt: req.query.to}}
      ]
    };
  } else if (typeof req.query.to != 'undefined' && req.query.to) {
    request = {timestamp: {$lt: req.query.to}};
  } else {
    request = {};
  }

  SensorMeasure
    .find(request)
    .select('-_id -__v')
    .sort({'_id': -1})
    .limit(limit)
    .exec(
    function (err, measures) {
      if (err) {
        console.error('error', err.message);
        return res.status(500).json({
          message: err.message
        });
      }
      return res.json(measures);
    });
});

router.get('/sensors', function (req, res, next) {
  Sensor
    .find({})
    .select('-_id -__v')
    .sort({'name': 1})
    .exec(function(err, sensors) {
    if (err) {
      console.error('error', err.message);
      return res.status(500).json({
        message: err.message
      });
    }
    return res.json(sensors);
  });

});

module.exports = router;
