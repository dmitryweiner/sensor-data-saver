let express = require('express');
let router = express.Router();
let SensorMeasure = require('../models/sensorMeasure');
let Image = require('../models/image');
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
    .select('-__v') // exclude these fields
    .sort({ '_id': 1 })
    .limit(limit * reduceRatio)
    .exec(
      function (err, measures) {
        if (err) {
          console.error('error', err.message);
          return res.status(500).json(JSON.stringify(err));
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
        return res.status(500).json(JSON.stringify(err));
      }
      return res.json(sensors);
    });

});

router.get('/images', function (req, res, next) {
  let id;
  if (typeof req.query.id === 'undefined') {
    return res.status(500).json({
      message: 'No id provided!'
    });
  } else {
    id = req.query.id;
  }

  Image.findOne({measureId: id}, (err, image) => {
    if (err) {
      console.error('error', err.message);
      return res.status(500).json(JSON.stringify(err));
    }
    if (!image) {
      return res.status(404).json({
        message: 'Not found'
      });
    }
    const img = new Buffer(image.content.replace(/^data:image\/jpeg;base64,/, ''), 'base64');

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': img.length
    });
    res.end(img);

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
  measures.reverse().forEach((measure, index) => {
    if ((index % reduceRatio) === 0) { // get 1st of Nth
      let measureToPut = measure;
      measureToPut.parameters = measureToPut.parameters.filter((parameter) => parameter.type !== 'image');
      result.push(measureToPut);
    }
  });
  return result.reverse();
}

module.exports = router;
