'use strict';

function init() {
  var updateInterval = 60*1000;
  var previousTime;
  var groups = new vis.DataSet();
  var dataset = new vis.DataSet();
  var pressureDataset = new vis.DataSet();

  groups.add({
    id: 0,
    content: 'temperature'
  });

  groups.add({
    id: 1,
    content: 'humidity'
  });

  var options = {
    start: vis.moment().add(-1, 'days'),
    end: vis.moment(),
    autoResize: true,
    drawPoints: {
      style: 'circle' // square, circle
    },
    shaded: {
      orientation: 'bottom' // top, bottom
    },
    legend: {left:{position:"bottom-left"}}
  };

  var temperatureAndHumidityChart = new vis.Graph2d(document.getElementById('temperatureChart'), dataset, groups, options);
  var pressureChart = new vis.Graph2d(document.getElementById('pressureChart'), pressureDataset, options);

  function updateGraphs() {
    var currentTime = new Date().getTime();
    getData(previousTime, currentTime).then(function (measures) {
      measures.forEach(function (measure) {
        measure.parameters.forEach(function (parameter, key) {
          var d = {x: new Date(measure.timestamp).getTime(), y: parseFloat(parameter.value), group: key};
          if (key == 0 || key == 1) {
            dataset.add(d);
          } else {
            pressureDataset.add(d);
          }
        });
      });
      var maxTimestamp;
      measures.forEach(function(measure) {
        var current = new Date(measure.timestamp);
        if (!maxTimestamp || maxTimestamp < current) {
          maxTimestamp = current;
        }
      });
      if (maxTimestamp) {
        temperatureAndHumidityChart.setWindow(vis.moment(maxTimestamp).add(-1, 'days'), maxTimestamp, {animation: false});
        pressureChart.setWindow(vis.moment(maxTimestamp).add(-1, 'days'), maxTimestamp, {animation: false});
      }
    }).catch(function (error) {
      console.error(error);
    });
    previousTime = currentTime;
    setTimeout(updateGraphs, updateInterval);
  }
  updateGraphs();

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

    // TODO: load list of sensors dynamically via /sensors
    xmlhttp.open('GET', '/measures/bme280/?from=' + (previousTime ?  previousTime : '') + '&to=' + currentTime, true);
    xmlhttp.send();
  });
}
