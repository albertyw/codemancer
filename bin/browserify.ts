import fs = require('fs');
import path = require('path');

import browserify = require('browserify');
import dotenv = require('dotenv');
import minifyStream = require('minify-stream');
import util = require('../server/util');

dotenv.config();
const inputFile = path.join(__dirname, '..', 'codemancer', 'js', 'index.ts');
const outputFile = path.join(__dirname, '..', 'codemancer', 'js', util.getJSFileName());

browserify(inputFile, {debug: true})
  .plugin('tsify', {target: 'es6'})
  .transform('unassertify', {global: true})
  .transform('envify', {global: true})
  .plugin('common-shakeify')
  .plugin('browser-pack-flat/plugin')
  .transform('babelify',  {presets: ['@babel/preset-env'], extensions: ['.ts']})
  .bundle()
  .pipe(minifyStream({
    mangle: false,
    toplevel: true,
    keep_fnames: true,
    keep_classnames: true,
  }))
  .pipe(fs.createWriteStream(outputFile));
