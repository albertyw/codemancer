import appRootPath from 'app-root-path';
import fs from 'fs';
import path from 'path';

import getRollbar from '../codemancer/js/rollbar.js';
import varsnap from '../codemancer/js/varsnap.js';

const appRoot = appRootPath.toString();

interface SVGs {
  github: string;
  toggledemo: string;
  location: string;
}

export const getSVGs: () => Promise<SVGs> = varsnap(function getSVGs(): Promise<SVGs> {
  const svgs: SVGs = {
    github: '',
    toggledemo: '',
    location: '',
  };
  function readSVGFile(svgFile: string, svgName: 'github' | 'toggledemo' | 'location'): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const svgPath = path.join(appRoot, 'codemancer', 'img', svgFile);
      fs.readFile(svgPath, (err, data) => {
        if (err) {
          return reject(err);
        }
        svgs[svgName] = data.toString();
        return resolve(data.toString());
      });
    });
  }
  const readers = [
    readSVGFile('github.svg', 'github'),
    readSVGFile('toggledemo.svg', 'toggledemo'),
    readSVGFile('location.svg', 'location'),
  ];
  return Promise.all(readers).then(() => {
    return svgs;
  }).catch(error => {
    getRollbar().error(error);
    return svgs;
  });
});
