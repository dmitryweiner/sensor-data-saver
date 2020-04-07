var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
var mongoose = require('mongoose');
var config = require('./config');

var SensorMeasure = require('./models/sensorMeasure');
var Sensor = require('./models/sensor');
var Image = require('./models/image');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.Promise = global.Promise;
mongoose.connect(config.database); // connect to database
const mongooseConnection = mongoose.connection;

/** mongose internal error handling */
mongooseConnection.on(
  'error',
  function (err) {
    console.log('mongoose error handler', err);
  }
);

var client = mqtt.connect('mqtt://localhost', {
  username: config.mqtt.user,
  password: config.mqtt.password
});

client.on('connect', function () {
  client.subscribe('sensors/+');
});

client.on('message', async function (topic, message) {
  var messageBody, sensorMeasure, sensorName;
  sensorName = topic.split('/')[1];

  try {
    var sensor;
    try {
      sensor = await Sensor.findOne({ 'name': sensorName }).exec();
    } catch (e) {
      sensor = new Sensor({
        name: sensorName,
        description: '' // will be implemented later (may be)
      });
      await sensor.save();
    }

    messageBody = JSON.parse(message.toString());
    sensorMeasure = new SensorMeasure();
    sensorMeasure.sensorId = sensor._id;
    sensorMeasure.parameters = messageBody.parameters.filter(function(parameter) {
      if (parameter.type !== 'image') {
        return parameter;
      }
    });
    await sensorMeasure.save();

    var imageParameter = messageBody.parameters.find(function(parameter) {
      return parameter.type === 'image';
    });
    if (imageParameter) {
      var image = new Image();
      image.measureId = sensorMeasure._id;
      image.content = imageParameter.value;
      await image.save();
    }
  } catch (err) {
    console.error('An error occured:', err, topic, message.toString());
  }
});

module.exports = app;
