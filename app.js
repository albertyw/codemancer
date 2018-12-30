const express = require('express');
const app = express();
const port = 5002;

app.use(express.static('codemancer'));

app.listen(port, () => console.log('Listening on port ' + port));
