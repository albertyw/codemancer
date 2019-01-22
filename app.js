const child_process = require("child_process");
const console = require("console");
const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const mustache = require("mustache");
const path = require("path");
const rfs = require("rotating-file-stream");

require("dotenv").config();
const port = process.env.LISTEN_PORT;
const app = express();

// Set up logging
app.use(morgan("combined"));
var accessLogStream = rfs("access.log", {
    interval: "1d",
    path: path.join(__dirname, "logs", "app")
});
app.use(morgan("combined", {stream: accessLogStream }));

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

app.get("/", (req, res) => {
    res.render('index', {});
});
app.use("/css", express.static(path.join("codemancer", "css")));
app.use("/font", express.static(path.join("codemancer", "font")));
app.use("/img", express.static(path.join("codemancer", "img")));
app.use("/js", express.static(path.join("codemancer", "js")));

app.listen(port, () => console.log("Listening on port " + port));
