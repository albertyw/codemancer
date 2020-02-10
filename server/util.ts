import appRootPath = require('app-root-path');
import child_process = require('child_process');
import fs = require('fs');
import path = require('path');

import Rollbar = require('../codemancer/js/rollbar');
import util = require('../codemancer/js/util');
import varsnap = require('../codemancer/js/varsnap');

const appRoot = appRootPath.toString();

export function getJSFileName() {
  const head = child_process.execSync('git rev-parse HEAD');
  const version = util.trimString(head.toString());
  const outputFileName = 'codemancer.' + version + '.min.js';
  return outputFileName;
}

export const getSVGs = varsnap(function getSVGs() {
  const svgs = {};
  function readSVGFile(svgFile, svgName) {
    return (resolve, reject) => {
      const svgPath = path.join(appRoot, 'codemancer', 'img', svgFile);
      fs.readFile(svgPath, (err, data) => {
        if (err) {
          return reject(err);
        }
        svgs[svgName] = data.toString();
        return resolve(data.toString());
      });
    };
  }
  const readers = [
    new Promise(readSVGFile('calendar-plus-o.svg', 'calendarAuth')),
    new Promise(readSVGFile('calendar-minus-o.svg', 'calendarSignout')),
    new Promise(readSVGFile('github.svg', 'github')),
    new Promise(readSVGFile('sunrisesunset.svg', 'sunrisesunset')),
    new Promise(readSVGFile('toggledemo.svg', 'toggledemo')),
  ];
  return Promise.all(readers).then(() => {
    return svgs;
  }).catch(error => {
    Rollbar.error(error);
    return svgs;
  });
});
