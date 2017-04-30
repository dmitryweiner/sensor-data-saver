'use strict';

function init() {
  var updateInterval = 2000;
  var previousTime;
  var temperatureSeries = new vis.DataSet();
  var pressureSeries = new vis.DataSet();
  var humiditySeries = new vis.DataSet();

  var options = {
    start: vis.moment().add(-10, 'minutes'), // changed so its faster
    end: vis.moment(),
/*
    dataAxis: {
      left: {
        range: {
          min:-10, max: 10
        }
      }
    },
*/
    autoResize: true,
    drawPoints: {
      style: 'circle' // square, circle
    },
    shaded: {
      orientation: 'bottom' // top, bottom
    }
  };

  var temperatureChart = new vis.Graph2d(document.getElementById('temperatureChart'), temperatureSeries, options);
  var pressureChart = new vis.Graph2d(document.getElementById('pressureChart'), pressureSeries, options);
  var humidityChart = new vis.Graph2d(document.getElementById('humidityChart'), humiditySeries, options);

  setInterval(function() {
    var currentTime = new Date().getTime();
    getData(previousTime, currentTime).then(function (measures) {
      measures.forEach(function (measure) {
        temperatureSeries.add({x: new Date(measure.timestamp).getTime(), y: measure.temperature});
        humiditySeries.add({x: new Date(measure.timestamp).getTime(), y: measure.humidity});
        pressureSeries.add({x: new Date(measure.timestamp).getTime(), y: measure.pressure});
      });
      var maxTimestamp;
      measures.forEach(function(measure) {
        var current = new Date(measure.timestamp);
        if (!maxTimestamp || maxTimestamp < current) {
          maxTimestamp = current;
        }
      });
      temperatureChart.setWindow(vis.moment(maxTimestamp).add(-10, 'minutes'), maxTimestamp, {animation: false});
      humidityChart.setWindow(vis.moment(maxTimestamp).add(-10, 'minutes'), maxTimestamp, {animation: false});
      pressureChart.setWindow(vis.moment(maxTimestamp).add(-10, 'minutes'), maxTimestamp, {animation: false});
    }).catch(function (error) {
      console.error(error);
    });
    previousTime = currentTime;
    
  }, updateInterval);
}

function getData(previousTime, currentTime){
  return new Promise(function(resolve, reject){
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
        if (xmlhttp.status == 200) {
          resolve(JSON.parse(xmlhttp.responseText));
        } else {
          reject('Error with code ' + xmlhttp.status);
        }
      }
    };

    xmlhttp.open('GET', '/measures?from=' + (previousTime ?  previousTime : '') + '&to=' + currentTime, true);
    xmlhttp.send();
  });
}