const sunRiseSetAPI = "https://api.sunrise-sunset.org/json?lat=37.778519&lng=-122.40564&formatted=0";
var AppDate = Date;

const fullNight = [0, 0, 0];
const fullDay = [0, 204, 255];
const brightEvening = [255, 110, 30];
const midEvening = [255, 155, 0];
const lateEvening = [0, 0, 255];

const colors = {
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

let colorsTimestamp = Object.keys(colors);
const updateBackgroundColorPeriod = 5 * 60 * 1000;
let updateBackgroundColorInterval = undefined;

function generateColorsArray(){
    const req = new XMLHttpRequest();
    req.open("GET", sunRiseSetAPI);
    req.responseType = "json";
    req.onload = function sunRiseSetReady() {
        const data = parseData(req.response);
        const sunrise = dateToMinutes(data["sunrise"]);
        const sunset = dateToMinutes(data["sunset"]);
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
    };
    req.send();
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
    const timestamp = date.getHours() * 60 + date.getMinutes();
    return timestamp;
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function currentTimestamp() {
    const currentDate = new AppDate();
    return dateToMinutes(currentDate);
}

function getCurrentColor(current) {
    let before = 0;
    let after = 0;
    for (let i=0; i<colorsTimestamp.length; i++) {
        if (colorsTimestamp[i] <= current && colorsTimestamp[i+1] > current) {
            before = colorsTimestamp[i];
            after = colorsTimestamp[i+1];
            break;
        }
    }
    const percentage = (current - before) / (after - before);
    const colorBefore = colors[before];
    const colorAfter = colors[after];
    const currentColor = [0, 0, 0];
    for (let i=0; i<colorBefore.length; i++) {
        currentColor[i] = colorBefore[i] + (colorAfter[i] - colorBefore[i]) * percentage;
        currentColor[i] = Math.round(currentColor[i]);
    }
    return rgbToHex(currentColor[0], currentColor[1], currentColor[2]);
}

function updateBackgroundColor(){
    const current = currentTimestamp();
    const currentColor = getCurrentColor(current);
    document.body.style.backgroundColor = currentColor;
    if (updateBackgroundColorInterval === undefined) {
        updateBackgroundColorInterval = setInterval(function() {
            updateBackgroundColor();
        }, updateBackgroundColorPeriod);
    }
}

function runOnload(onloadFunc) {
    if(window.attachEvent) {
        window.attachEvent("onload", onloadFunc);
    } else {
        if(window.onload) {
            const currOnload = window.onload;
            const newOnload = function(evt) {
                currOnload(evt);
                onloadFunc(evt);
            };
            window.onload = newOnload;
        } else {
            window.onload = onloadFunc;
        }
    }
}

updateBackgroundColor();
runOnload(generateColorsArray);
