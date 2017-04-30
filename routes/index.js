var express = require('express');
var router = express.Router();
var SensorMeasure = require('../models/sensorMeasure');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/measures', function (req, res, next) {
  var request, limit = 0;

  if (typeof req.query.from != 'undefined' && req.query.from &&
    typeof req.query.to != 'undefined' && req.query.to
  ) {
    request = {
      $and: [
        {timestamp: {$gt: req.query.from}},
        {timestamp: {$lt: req.query.to}}
      ]
    };
  } else if(typeof req.query.to != 'undefined' && req.query.to) {
    request = {timestamp: {$lt: req.query.to}};
    limit = 100;
  } else {
    request = {};
    limit = 100;
  }

  SensorMeasure.find(request,
    null,
    {
      sort: {'timestamp': -1},
      limit: limit
    }
  ).exec(
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

module.exports = router;
