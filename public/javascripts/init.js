'use strict';

document.addEventListener('DOMContentLoaded', function () {

  let updateInterval = 60 * 1000;
  let reduceRatio = 6;
  let timeoutId;
  let previousTime = moment().add(-1, 'days').valueOf();
  let currentTime;
  let dataset = [];
  let chart = new Dygraph(document.getElementById('chart'), dataset, {
    legend: 'always',
    drawPoints: true,
    width: 800,
    height: 600,
    labels: ['Time', 'Temperature', 'Humidity', 'Pressure'],
    series: {
      'Pressure': { axis: 'y2' },
    },
    x: {},
    y: {},
    y2: {},
  });

  /**
   * Get data from server
   *
   * @param previousTime
   * @param currentTime
   * @param reduceRatio
   * @returns {Promise}
   */
  function getData(previousTime, currentTime, reduceRatio) {
    const isLoadPictures = document.getElementById('isLoadPictures').checked;

    return new Promise(function (resolve, reject) {
      let xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status == 200) {
            resolve(JSON.parse(xmlhttp.responseText));
          } else {
            reject('Error with code ' + xmlhttp.status);
          }
        }
      };

      // TODO: load list of sensors dynamically via /sensors
      xmlhttp.open('GET',
        '/measures/bme280/?from='
        + (previousTime ? previousTime : '')
        + '&to=' + currentTime
        + '&reduceRatio=' + reduceRatio
        + '&isLoadPictures=' + (isLoadPictures ? 1 : 0), true);
      xmlhttp.send();
    });
  }

  /**
   * Update graphs with given data
   * @param measures
   */
  function updateGraphs(measures) {
    if (!measures.length) {
      return false;
    }

    measures.forEach(function (measure) {
      dataset.push([
        new Date(measure.timestamp),
        parseFloat(measure.parameters[0].value),
        parseFloat(measure.parameters[1].value),
        parseFloat(measure.parameters[2].value)
      ]);
    });

    chart.updateOptions({ 'file': dataset });
  }

  /**
   * Clear all data
   */
  function clearDatasets() {
    dataset = [];
    chart.updateOptions({ file: dataset });
  }

  /**
   * The main working cycle
   */
  function workingCycle() {
    currentTime = new Date().getTime();
    controlSpinner(true);
    getData(previousTime, currentTime, reduceRatio).then(function (measures) {
      updateGraphs(measures);
      controlSpinner(false);
    }).catch(function (error) {
      console.error(error);
    });
    previousTime = currentTime;
    timeoutId = setTimeout(workingCycle, updateInterval);
  }

  /**
   * Control spinner state (on|off)
   * @param {boolean} state
   * @returns {boolean}
   */
  function controlSpinner(state) {
    let spinnerElement = document.getElementById('spinner');

    if (!spinnerElement) {
      return false;
    }

    spinnerElement.style.display = state ? 'block' : 'none';
  }

  let daysSelector = document.getElementById('days');
  if (daysSelector) {
    daysSelector.addEventListener('change', function (event) {
      clearTimeout(timeoutId);
      clearDatasets();
      previousTime = moment().add(0 - event.target.value, 'days').valueOf();
      reduceRatio = reduceRatioSelector ? reduceRatioSelector.value : null;
      workingCycle();
    });
  }


  let reduceRatioSelector = document.getElementById('reduceRatio');
  if (reduceRatioSelector) {
    reduceRatioSelector.addEventListener('change', function (event) {
      clearTimeout(timeoutId);
      clearDatasets();
      previousTime = daysSelector ? moment().add(0 - daysSelector.value, 'days').valueOf() : null;
      reduceRatio = event.target.value;
      workingCycle();
    });
  }

  let isLoadPictures = document.getElementById('isLoadPictures');
  if (isLoadPictures) {
    isLoadPictures.addEventListener('change', function (event) {
      clearTimeout(timeoutId);
      clearDatasets();
      previousTime = moment().add(-1, 'days').valueOf(); // should be from controls
      workingCycle();
    });
  }

  workingCycle();
});
