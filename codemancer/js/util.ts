import axios = require('axios');
import Rollbar = require('./rollbar');
import Storage = require('./storage');

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
 * AJAX request Promise that caches responses
 **/
const requestPromise = function request(url, cacheExpirationDuration) {
  const responseText = Storage.getExpirableData(url, cacheExpirationDuration/2, false);
  if(responseText !== null) {
    const response = JSON.parse(responseText);
    return Promise.resolve(response);
  }

  const request = axios.get(url).then((response) => {
    Storage.setExpirableData(url, JSON.stringify(response.data));
    return response.data;
  }).catch((error) => {
    const responseText = Storage.getExpirableData(url, cacheExpirationDuration, true);
    if (responseText === null) {
      const e = new CustomError('Unrecoverable error when making request', error.response);
      Rollbar.error(e);
      throw e;
    }
    const response = JSON.parse(responseText);
    return response;
  });
  return request;
};

const CustomError = function CustomError(message, metadata) {
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
  requestPromise: requestPromise,
  CustomError: CustomError,
};
