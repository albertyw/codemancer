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
    return (resolve, reject) => {
      const svgPath = path.join(__dirname, '..', 'codemancer', 'img', svgFile);
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
    new Promise(readSVGFile('sunrisesunset.svg', 'sunrisesunset')),
    new Promise(readSVGFile('toggledemo.svg', 'toggledemo')),
    new Promise(readSVGFile('calendar-plus-o.svg', 'calendarAuth')),
    new Promise(readSVGFile('calendar-minus-o.svg', 'calendarSignout')),
  ];
  return Promise.all(readers).then(() => {
    return svgs;
  });
}

module.exports = {
  getJSFileName: getJSFileName,
  getSVGs: getSVGs,
};
