const console = require("console");
const Git = require("nodegit");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const rfs = require("rotating-file-stream");

const app = express();
const port = 5002;

app.use(morgan("combined"));
var accessLogStream = rfs("access.log", {
    interval: "1d",
    path: path.join(__dirname, "logs", "app")
});
app.use(morgan("combined", {stream: accessLogStream }));

let version = "";
function getAndRespondVersion(res) {
    Git.Repository.open(".").then( function( repository ) {
        return repository.getHeadCommit( );
    } ).then( function ( commit ) {
        return commit.sha();
    } ).then( function ( hash ) {
        version = hash;
        res.send(version);
    } );
}

app.get("/version", (req, res) => {
    if(version !== "") {
        res.send(version);
        return;
    }
    getAndRespondVersion(res);
});

app.use(express.static("codemancer"));

app.listen(port, () => console.log("Listening on port " + port));
