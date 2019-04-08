/**
 *  When called, runOnload will call the onloadFunc when the window is loaded
 */
function runOnload(onloadFunc) {
  if(window.attachEvent) {
    window.attachEvent('onload', onloadFunc);
  } else {
    if(window.onload) {
      const currOnload = window.onload;
      const newOnload = function(evt) {
        currOnload(evt);
        onloadFunc(evt);
      };
      window.onload = newOnload;
    } else {
      window.onload = onloadFunc;
    }
  }
}

let demoOn = false;

function toggleDemo() {
  demoOn = !demoOn;
  return demoOn;
}

/**
 * This returns the current Date object or else returns a mocked date
 * for demo purposes
 **/
function getMockDate() {
  const date = new Date();
  if(!demoOn) {
    return date;
  }
  const timestep = date.getSeconds() + date.getMinutes() * 60;
  const hours = timestep % 24;
  date.setHours(hours);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}

/**
 * Return the value after a chain of accessors;
 * returns undefined instead of an exception if the chain is broken
 **/
function chainAccessor(data, properties) {
  let value = data;
  for(let x=0; x<properties.length; x++) {
    value = value && value[properties[x]];
  }
  return value;
}

/**
 * Trim whitespace around a string
 **/
function trimString(s) {
  return s.replace(/^\s+|\s+$/g, '');
}

module.exports = {
  runOnload: runOnload,
  toggleDemo: toggleDemo,
  getMockDate: getMockDate,
  chainAccessor: chainAccessor,
  trimString: trimString,
};
