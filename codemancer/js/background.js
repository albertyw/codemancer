var colors = {};
colors[timeToSeconds(0, 0)] = [0, 0, 0];
colors[timeToSeconds(5, 0)] = [0, 0, 0];
colors[timeToSeconds(8, 0)] = [0, 0, 255];
colors[timeToSeconds(12, 0)] = [0, 204, 255];
colors[timeToSeconds(16, 0)] = [0, 204, 255];
colors[timeToSeconds(17, 0)] = [253, 94, 83];
colors[timeToSeconds(18, 0)] = [255, 155, 0];
colors[timeToSeconds(21, 0)] = [0, 0, 0];
colors[timeToSeconds(24, 0)] = colors[timeToSeconds(0, 0)];

var colorsTimestamp = [];
var updateBackgroundColorPeriod = 5 * 60 * 1000;

function generateColorsArray(){
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
generateColorsArray();
updateBackgroundColor();
