const child_process = require('child_process');

const util = require('../codemancer/js/util');

function getJSFileName() {
  const head = child_process.execSync('git rev-parse HEAD');
  const version = util.trimString(head.toString());
  const outputFileName = 'codemancer.' + version + '.min.js';
  return outputFileName;
}

module.exports = {
  getJSFileName: getJSFileName,
};
