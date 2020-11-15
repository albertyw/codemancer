import fs = require('fs');
import path = require('path');

import browserify = require('browserify');
import dotenv = require('dotenv');
import util = require('../server/util');

dotenv.config();
const inputFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.ts');
const outputFile = path.join(__dirname, '..', 'codemancer', 'js', util.getJSFileName());

browserify(inputFile, {debug: true})
  .plugin('tsify', {target: 'es6'})
  .plugin('tinyify')
  .transform('babelify',  {presets: ['@babel/preset-env'], extensions: ['.ts']})
  .bundle()
  .pipe(fs.createWriteStream(outputFile));
