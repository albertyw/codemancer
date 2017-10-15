var sunRiseSetAPI = 'https://api.sunrise-sunset.org/json?lat=37.778519&lng=-122.40564?formatted=0';

var fullNight = [0, 0, 0];
var fullDay = [0, 204, 255];
var brightEvening = [255, 110, 30];
var midEvening = [255, 155, 0];
var lateEvening = [0, 0, 255];

var colors = {};
colors[timeToSeconds(0, 0)] = fullNight;
colors[timeToSeconds(5, 0)] = fullNight;
colors[timeToSeconds(8, 0)] = lateEvening;
colors[timeToSeconds(12, 0)] = fullDay;
colors[timeToSeconds(16, 0)] = fullDay;
colors[timeToSeconds(17, 0)] = brightEvening;
colors[timeToSeconds(18, 0)] = midEvening;
colors[timeToSeconds(21, 0)] = fullNight;
colors[timeToSeconds(24, 0)] = colors[timeToSeconds(0, 0)];

var colorsTimestamp = [];
var updateBackgroundColorPeriod = 5 * 60 * 1000;

function generateColorsArray(){
    $.get(sunRiseSetAPI,
        function(data) {
            // data.results['civil_twilight_begin']
            console.log(data);
        }
    );
    colorsTimestamp = Object.keys(colors);
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function timeToSeconds(hour, minute) {
    var timestamp = hour * 60 + minute;
    return timestamp;
}

function currentTimestamp() {
    var currentDate = new Date();
    return timeToSeconds(currentDate.getHours(), currentDate.getMinutes())
}

function getCurrentColor(current) {
    for (var i=0; i<colorsTimestamp.length; i++) {
        if (colorsTimestamp[i] <= current && colorsTimestamp[i+1] > current) {
            var before = colorsTimestamp[i];
            var after = colorsTimestamp[i+1];
            break;
        }
    }
    var percentage = (current - before) / (after - before);
    var colorBefore = colors[before];
    var colorAfter = colors[after];
    var currentColor = [0, 0, 0];
    for (i=0; i<colorBefore.length; i++) {
        currentColor[i] = colorBefore[i] + (colorAfter[i] - colorBefore[i]) * percentage;
        currentColor[i] = Math.round(currentColor[i]);
    }
    return rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
}

function updateBackgroundColor(){
    var current = currentTimestamp();
    var currentColor = getCurrentColor(current);
    document.body.style.backgroundColor = currentColor;
    setTimeout(function() {
        updateBackgroundColor();
    }, updateBackgroundColorPeriod);
}
$(function() {
    generateColorsArray();
    updateBackgroundColor();
});
