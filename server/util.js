const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const util = require('../codemancer/js/util');

function getJSFileName() {
  const head = child_process.execSync('git rev-parse HEAD');
  const version = util.trimString(head.toString());
  const outputFileName = 'codemancer.' + version + '.min.js';
  return outputFileName;
}

function getSVGs() {
  const svgs = {};
  function readSVGFile(svgFile, svgName) {
    const svgPath = path.join(__dirname, '..', 'codemancer', 'img', svgFile);
    fs.readFile(svgPath, (err, data) => {
      if (err) {
        data = '';
      }
      svgs[svgName] = data;
    });
  }
  readSVGFile('sunrisesunset.svg', 'sunrisesunset');
  readSVGFile('toggledemo.svg', 'toggledemo');
  readSVGFile('calendar-plus-o.svg', 'calendarAuth');
  readSVGFile('calendar-minus-o.svg', 'calendarSignout');
  return svgs;
}

module.exports = {
  getJSFileName: getJSFileName,
  getSVGs: getSVGs,
};
