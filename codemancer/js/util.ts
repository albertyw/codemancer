import axios from 'axios';
import Rollbar = require('./rollbar');
import Storage = require('./storage');

let demoOn = false;

export function toggleDemo() {
  demoOn = !demoOn;
  return demoOn;
}

/**
 * This returns the current Date object or else returns a mocked date
 * for demo purposes
 **/
export function getMockDate() {
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
export const chainAccessor = function chainAccessor(data, properties) {
  let value = data;
  for(let x=0; x<properties.length; x++) {
    value = value && value[properties[x]];
  }
  return value;
};

/**
 * Trim whitespace around a string
 **/
export const trimString = function trimString(s) {
  return s.replace(/^\s+|\s+$/g, '');
};

/**
 * Return a copy of the array with only unique items
 **/
export const unique = function unique(array) {
  return Array.from(new Set(array));
};

/**
 * AJAX request Promise that caches responses
 **/
export const requestPromise = function request(url, cacheExpirationDuration) {
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
      const e = CustomError.create('Unrecoverable error when making request', error.response);
      Rollbar.error(e);
      throw e;
    }
    const response = JSON.parse(responseText);
    return response;
  });
  return request;
};

export class CustomError extends Error {
  public metadata = '';

  constructor(message) {
    super(message);
  }

  static create(message, metadata) {
    const error = new CustomError(message);
    error.metadata = metadata;
    return error;
  }
}
