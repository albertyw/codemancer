const child_process = require("child_process");
const console = require("console");
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const mustache = require("mustache");
const path = require("path");
const Rollbar = require("rollbar");
const rfs = require("rotating-file-stream");

require("dotenv").config();
const port = process.env.LISTEN_PORT;
const app = express();
const rollbar = new Rollbar(process.env.ROLLBAR_CLIENT_ACCESS);

// Set up logging
app.use(morgan("combined"));
var accessLogStream = rfs("access.log", {
    interval: "1d",
    path: path.join(__dirname, "logs", "app")
});
app.use(morgan("combined", {stream: accessLogStream }));
app.use(rollbar.errorHandler());

// Set up mustache
// To set functioning of mustachejs view engine
app.engine("html", function (filePath, options, callback) {
    fs.readFile(filePath, function (err, content) {
        if(err) {
            return callback(err);
        }
        var rendered = mustache.to_html(content.toString(),options);
        return callback(null, rendered);
    });
});
app.set("views", path.join(__dirname, "codemancer"));
app.set("view engine","html");

let version = "";
function getAndRespondVersion(res) {
    child_process.exec("git rev-parse HEAD", function(err, stdout) {
        version = stdout;
        res.send(version);
    });
}

app.get("/version", (req, res) => {
    if(version !== "") {
        res.send(version);
        return;
    }
    getAndRespondVersion(res);
});

const svg = {};
let readFileCalls = 0;
let readFileFinished = 0;
function readSVGFile(svgFile, svgName) {
    readFileCalls++;
    const svgPath = path.join(__dirname, "codemancer", "img", svgFile);
    fs.readFile(svgPath, (err, data) => {
        if (err) {
            data = "";
        }
        svg[svgName] = data;
        readFileFinished++;
        if(readFileCalls === readFileFinished) {
            listen();
        }
    });
}
readSVGFile("wunderground.svg", "wunderground");
readSVGFile("sunrisesunset.svg", "sunrisesunset");
readSVGFile("toggledemo.svg", "toggledemo");
readSVGFile("calendar-plus-o.svg", "calendarAuth");
readSVGFile("calendar-minus-o.svg", "calendarSignout");

app.get("/", (req, res) => {
    const templateVars = {
        ROLLBAR_CLIENT_ACCESS: process.env.ROLLBAR_CLIENT_ACCESS,
        SEGMENT_TOKEN: process.env.SEGMENT_TOKEN,
        LOGFIT_TOKEN: process.env.LOGFIT_TOKEN,
        WUNDERGROUND_SVG: svg.wunderground,
        SUNRISESUNSET_SVG: svg.sunrisesunset,
        TOGGLEDEMO_SVG: svg.toggledemo,
        CALENDAR_AUTH_SVG: svg.calendarAuth,
        CALENDAR_SIGNOUT_SVG: svg.calendarSignout,
    };
    res.render("index", templateVars);
});
app.use("/css", express.static(path.join("codemancer", "css")));
app.use("/font", express.static(path.join("codemancer", "font")));
app.use("/img", express.static(path.join("codemancer", "img")));
app.use("/js", express.static(path.join("codemancer", "js")));

function listen(){
    app.listen(port, () => console.log("Listening on port " + port));
}
