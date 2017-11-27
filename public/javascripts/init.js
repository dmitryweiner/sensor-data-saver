'use strict';

document.addEventListener('DOMContentLoaded', function () {

    let updateInterval = 60 * 1000;
    let reduceRatio = 1;
    let timeoutId;
    let previousTime;
    let currentTime;
    let temperatureGroups = new vis.DataSet();
    let pressureGroups = new vis.DataSet();
    let dataset = new vis.DataSet();
    let pressureDataset = new vis.DataSet();

    function getData(previousTime, currentTime, reduceRatio) {
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
                + '&reduceRatio=' + reduceRatio, true);
            xmlhttp.send();
        });
    }

    function updateGraphs(measures) {
        measures.forEach(function (measure) {
            measure.parameters.forEach(function (parameter, key) {
                let d = {x: new Date(measure.timestamp).getTime(), y: parseFloat(parameter.value), group: key};
                if (key == 0 || key == 1) {
                    dataset.add(d);
                } else {
                    pressureDataset.add(d);
                }
            });
        });
        let maxTimestamp;
        measures.forEach(function (measure) {
            let current = new Date(measure.timestamp);
            if (!maxTimestamp || maxTimestamp < current) {
                maxTimestamp = current;
            }
        });
        if (maxTimestamp) {
            temperatureAndHumidityChart
                .setWindow(
                    vis.moment(maxTimestamp).add(-1, 'days'),
                    vis.moment(maxTimestamp).add(5, 'minutes'),
                    {animation: false});
            pressureChart
                .setWindow(
                    vis.moment(maxTimestamp).add(-1, 'days'),
                    vis.moment(maxTimestamp).add(5, 'minutes'),
                    {animation: false});
        }
    }

    function workingCycle() {
        currentTime = new Date().getTime();
        getData(previousTime, currentTime, reduceRatio).then(function (measures) {
            updateGraphs(measures);
        }).catch(function (error) {
            console.error(error);
        });
        previousTime = currentTime;
        timeoutId = setTimeout(workingCycle, updateInterval);
    }

    temperatureGroups.add({
        id: 0,
        content: 'temperature'
    });

    temperatureGroups.add({
        id: 1,
        content: 'humidity'
    });

    pressureGroups.add({
        id: 0,
        content: 'pressure'
    });

    let options = {
        start: vis.moment().add(-1, 'days'),
        end: vis.moment().add(5, 'minutes'),
        autoResize: true,
        drawPoints: {
            style: 'circle' // square, circle
        },
        shaded: {
            orientation: 'bottom' // top, bottom
        },
        legend: {left: {position: "bottom-left"}}
    };

    let temperatureAndHumidityChart = new vis.Graph2d(document.getElementById('temperatureChart'), dataset, temperatureGroups, options);
    let pressureChart = new vis.Graph2d(document.getElementById('pressureChart'), pressureDataset, pressureGroups, options);

    let daysSelector = document.getElementById('days');
    if (daysSelector) {
        daysSelector.addEventListener('change', function (event) {
            clearTimeout(timeoutId);
            previousTime = vis.moment().add(0 - event.target.value, 'days');
            workingCycle();
        });
    }


    let reduceRatioSelector = document.getElementById('reduceRatio');
    if (reduceRatioSelector) {
        reduceRatioSelector.addEventListener('change', function (event) {
            clearTimeout(timeoutId);
            reduceRatio = event.target.value;
            workingCycle();
        });
    }

    workingCycle();
});