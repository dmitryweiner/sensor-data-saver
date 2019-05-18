let express = require('express');
let router = express.Router();
let SensorMeasure = require('../models/sensorMeasure');
let Sensor = require('../models/sensor');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/measures/:sensor', function (req, res, next) {
  let request, limit = 0, reduceRatio = 1;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  } else {
    limit = 10000;
  }

  if (typeof req.query.reduceRatio !== 'undefined') {
    reduceRatio = req.query.reduceRatio;
  }

  if (typeof req.query.from !== 'undefined' && req.query.from &&
    typeof req.query.to !== 'undefined' && req.query.to
  ) {
    request = {
      $and: [
        { timestamp: { $gt: req.query.from } },
        { timestamp: { $lt: req.query.to } }
      ]
    };
  } else if (typeof req.query.to !== 'undefined' && req.query.to) {
    request = { timestamp: { $lt: req.query.to } };
  } else {
    request = {};
  }

  SensorMeasure
    .find(request)
    .select('-_id -__v')
    .sort({ '_id': 1 })
    .limit(limit * reduceRatio)
    .exec(
      function (err, measures) {
        if (err) {
          console.error('error', err.message);
          return res.status(500).json({
            message: err.message
          });
        }
        return res.json(reduce(measures, reduceRatio));
      });
});

router.get('/sensors', function (req, res, next) {
  Sensor
    .find({})
    .select('-_id -__v')
    .sort({ 'name': 1 })
    .exec(function (err, sensors) {
      if (err) {
        console.error('error', err.message);
        return res.status(500).json({
          message: err.message
        });
      }
      return res.json(sensors);
    });

});

/**
 * Make less measures.
 * Reduce ration defines how many measures should we omit (TODO: or merge).
 *
 * @param {Array} measures
 * @param {number} reduceRatio
 * @return {Array}
 */
function reduce(measures, reduceRatio) {
  let result = [];
  let currentMeasure = null;
  measures.forEach((measure, index) => {
    // TODO: here we should calculate average measure
    if (index % reduceRatio === 0) {
      result.push(measure);
    }
  });
  return result;
}

module.exports = router;
