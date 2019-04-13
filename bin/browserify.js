const fs = require('fs');

const browserify = require('browserify');
require('dotenv').config();

const inputFile = 'codemancer/js/index.js';
const outputFile = 'codemancer/js/codemancer.min.js';

browserify(inputFile, {debug: true})
  .transform('envify')
  .transform('babelify',  {presets: ['@babel/preset-env']})
  .transform('uglifyify', {compress: true, mangle: true, global: true})
  .bundle()
  .pipe(fs.createWriteStream(outputFile));
