const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const browserify = require('browserify');
require('dotenv').config();
const util = require('../codemancer/js/util');

function getOutputFileName() {
  const head = child_process.execSync('git rev-parse HEAD');
  const version = util.trimString(head.toString());
  const outputFileName = 'codemancer.' + version + '.min.js';
  return outputFileName;
}

const inputFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.js');
const outputFile = path.join(__dirname, '..', 'codemancer', 'js', getOutputFileName());

browserify(inputFile, {debug: true})
  .transform('envify')
  .transform('babelify',  {presets: ['@babel/preset-env']})
  .transform('uglifyify', {compress: true, mangle: true, global: true})
  .bundle()
  .pipe(fs.createWriteStream(outputFile));
