import appRootPath from 'app-root-path';
import fs from 'fs';
import path from 'path';

import getRollbar from '../codemancer/js/rollbar.js';
import varsnap from '../codemancer/js/varsnap.js';

const appRoot = appRootPath.toString();

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
    new Promise(readSVGFile('github.svg', 'github')),
    new Promise(readSVGFile('toggledemo.svg', 'toggledemo')),
  ];
  return Promise.all(readers).then(() => {
    return svgs;
  }).catch(error => {
    getRollbar().error(error);
    return svgs;
  });
});
