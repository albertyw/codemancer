const fs = require('fs');
const browserify = require('browserify');

browserify('codemancer/js/index.js')
    .transform('babelify')
    .bundle()
    .pipe(process.stdout);
