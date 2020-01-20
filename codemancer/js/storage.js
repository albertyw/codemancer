const localStorage = window.localStorage;

const locationKey = 'location';
const locationExpiration = 24 * 60 * 60 * 1000; // 1 day
const weatherKey = 'weather';
const weatherExpiration = 3 * 60 * 60 * 1000; // 3 hours
const defaultExpiration = weatherExpiration;

const Storage = {
  defaultExpiration: defaultExpiration,

  setLocationData: function setLocationData(data) {
    return Storage.setExpirableData(locationKey, data);
  },

  getLocationData: function getLocationData() {
    return Storage.getExpirableData(locationKey, locationExpiration);
  },

  setWeatherData: function setWeatherData(data) {
    return Storage.setExpirableData(weatherKey, data);
  },

  getWeatherData: function getWeatherData() {
    return Storage.getExpirableData(weatherKey, weatherExpiration);
  },

  setExpirableData: function setExpirableData(key, value) {
    localStorage.setItem(key, value);
    const expireKey = Storage.expireKey(key);
    const timestamp = Date.now().toString();
    localStorage.setItem(expireKey, timestamp);
  },

  getExpirableData: function getExpirableData(key, expirationDuration) {
    const expireKey = Storage.expireKey(key);
    const timestampString = localStorage.getItem(expireKey);
    const timestamp = parseInt(timestampString, 10);
    if (timestamp + expirationDuration < Date.now()) {
      localStorage.removeItem(key);
      localStorage.removeItem(expireKey);
    }
    const data = localStorage.getItem(key);
    return data;
  },

  expireKey: function expireKey(key) {
    return key + 'Time';
  },
};

module.exports = Storage;
