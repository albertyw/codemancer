const browserify = require('browserify');
require('dotenv').config();

browserify('codemancer/js/index.js')
  .transform('envify')
  .transform('babelify',  {presets: ['@babel/preset-env']})
  .transform('uglifyify', {compress: true, mangle: true, global: true})
  .bundle()
  .pipe(process.stdout);
