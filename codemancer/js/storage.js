const localStorage = window.localStorage;

const weatherKey = 'weather';
const weatherExpiration = 3 * 60 * 60 * 1000; // 3 hours

const Storage = {
  setWeatherData: function setWeatherData(data) {
    return Storage.setExpirableData(weatherKey, data);
  },

  getWeatherData: function getWeatherData() {
    return Storage.getExpirableData(weatherKey, weatherExpiration);
  },

  setExpirableData: function setExpirableData(key, value) {
    localStorage.setItem(key, value);
    const expireKey = key + 'Time';
    const timestamp = Date.now().toString();
    localStorage.setItem(expireKey, timestamp);
  },

  getExpirableData: function getExpirableData(key, expirationDuration) {
    const expireKey = key + 'Time';
    const timestampString = localStorage.getItem(expireKey);
    const timestamp = parseInt(timestampString, 10);
    if (timestamp + expirationDuration < Date.now()) {
      localStorage.removeItem(key);
      localStorage.removeItem(expireKey);
    }
    const data = localStorage.getItem(key);
    return data;
  },
};

module.exports = Storage;
