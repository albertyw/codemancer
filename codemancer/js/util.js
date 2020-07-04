const Rollbar = require('./rollbar');
const Storage = require('./storage');

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
const chainAccessor = function chainAccessor(data, properties) {
  let value = data;
  for(let x=0; x<properties.length; x++) {
    value = value && value[properties[x]];
  }
  return value;
};

/**
 * Trim whitespace around a string
 **/
const trimString = function trimString(s) {
  return s.replace(/^\s+|\s+$/g, '');
};

/**
 * Return a copy of the array with only unique items
 **/
const unique = function unique(array) {
  return Array.from(new Set(array));
};

/**
 * Wrapper around XMLHttpRequest that caches responses
 **/
const request = function request(url, onLoad, onError, cacheExpirationDuration) {
  const responseText = Storage.getExpirableData(url, cacheExpirationDuration/2, false);
  if(responseText !== null) {
    const response = JSON.parse(responseText);
    return onLoad(response);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = () => {
    if (Math.round(xhr.status / 100) != 2) {
      return xhr.onerror();
    }
    let response = {};
    try {
      response = JSON.parse(xhr.responseText);
    } catch(err) {
      return xhr.onerror();
    }
    Storage.setExpirableData(url, xhr.responseText);
    return onLoad(response);
  };
  xhr.onerror = () => {
    const responseText = Storage.getExpirableData(url, cacheExpirationDuration, true);
    if (responseText === null) {
      return onError(xhr.statusText);
    }
    Rollbar.error('Error when making request', url, xhr.status, xhr.readyState, xhr.responseText);
    const response = JSON.parse(responseText);
    return onLoad(response);
  };
  xhr.send();
};

const customError = function customError(message, metadata) {
  const error = new Error(message);
  error.metadata = metadata;
  return error;
};

module.exports = {
  toggleDemo: toggleDemo,
  getMockDate: getMockDate,
  chainAccessor: chainAccessor,
  trimString: trimString,
  unique: unique,
  request: request,
  customError: customError,
};
