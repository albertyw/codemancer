const fs = require('fs');
const path = require('path');

const browserify = require('browserify');
require('dotenv').config();

const inputFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.js');
const outputFile = path.join(__dirname, '..', 'codemancer', 'js', 'codemancer.min.js');

browserify(inputFile, {debug: true})
  .transform('envify')
  .transform('babelify',  {presets: ['@babel/preset-env']})
  .transform('uglifyify', {compress: true, mangle: true, global: true})
  .bundle()
  .pipe(fs.createWriteStream(outputFile));
