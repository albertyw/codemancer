const localStorage = window.localStorage;

const weatherKey = 'weather';
const weatherTimeKey = 'weatherTime';
const weatherExpiration = 3 * 60 * 60 * 1000; // 3 hours

const Storage = {
  setWeatherData: function setWeatherData(data) {
    localStorage.setItem(weatherKey, data);
    const timestamp = Date.now().toString();
    localStorage.setItem(weatherTimeKey, timestamp);
  },

  getWeatherData: function getWeatherData() {
    const timestampString = localStorage.getItem(weatherTimeKey);
    const timestamp = parseInt(timestampString, 10);
    if (timestamp + weatherExpiration < Date.now()) {
      localStorage.removeItem(weatherKey);
      localStorage.removeItem(weatherTimeKey);
    }
    const data = localStorage.getItem(weatherKey);
    return data;
  },
};

module.exports = Storage;
