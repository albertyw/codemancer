const fs = require('fs');
const browserify = require('browserify');

browserify('codemancer/js/index.js')
    .transform('babelify',  {presets: ['@babel/preset-env']})
    .bundle()
    .pipe(process.stdout);
