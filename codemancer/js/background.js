var sunRiseSetAPI = "https://api.sunrise-sunset.org/json?lat=37.778519&lng=-122.40564&formatted=0";

var fullNight = [0, 0, 0];
var fullDay = [0, 204, 255];
var brightEvening = [255, 110, 30];
var midEvening = [255, 155, 0];
var lateEvening = [0, 0, 255];

var colors = {};
var colors = {
    "0":[0,0,0],
    "235":[0,0,0],
    "295":[0,0,255],
    "355":[255,155,0],
    "415":[255,110,30],
    "475":[0,204,255],
    "1096":[0,204,255],
    "1156":[255,110,30],
    "1216":[255,155,0],
    "1276":[0,0,255],
    "1336":[0,0,0],
    "1440":[0,0,0]
};

var colorsTimestamp = Object.keys(colors);
var updateBackgroundColorPeriod = 5 * 60 * 1000;
var updateBackgroundColorInterval = undefined;

function generateColorsArray(){
    $.get(sunRiseSetAPI,
        function(data) {
            data = parseData(data);
            var sunrise = dateToMinutes(data["sunrise"]);
            var sunset = dateToMinutes(data["sunset"]);
            colors[sunrise - 120] = fullNight;
            colors[sunrise - 60] = lateEvening;
            colors[sunrise] = midEvening;
            colors[sunrise + 60] = brightEvening;
            colors[sunrise + 120] = fullDay;
            colors[sunset - 120] = fullDay;
            colors[sunset - 60] = brightEvening;
            colors[sunset] = midEvening;
            colors[sunset + 60] = lateEvening;
            colors[sunset + 120] = fullNight;
            colorsTimestamp = Object.keys(colors);
            updateBackgroundColor();
        }
    );
}

function parseData(data) {
    data = data.results;
    Object.keys(data).forEach(function(key) {
        if (key !== "day_length") {
            data[key] = new AppDate(data[key]);
        }
    });
    return data;
}

function dateToMinutes(date) {
    var timestamp = date.getHours() * 60 + date.getMinutes();
    return timestamp;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function currentTimestamp() {
    var currentDate = new AppDate();
    return dateToMinutes(currentDate);
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
    if (updateBackgroundColorInterval === undefined) {
        updateBackgroundColorInterval = setInterval(function() {
            updateBackgroundColor();
        }, updateBackgroundColorPeriod);
    }
}

updateBackgroundColor();
$(generateColorsArray);
