const browserify = require('browserify');
require('dotenv').config();

browserify('codemancer/js/index.js')
    .transform('envify')
    .transform('babelify',  {presets: ['@babel/preset-env']})
    .bundle()
    .pipe(process.stdout);
