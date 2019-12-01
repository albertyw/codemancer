const localStorage = window.localStorage;

const weatherKey = 'weather';

const Storage = {
  setWeatherData: function setWeatherData(data) {
    localStorage.setItem(weatherKey, data);
  },

  getWeatherData: function getWeatherData() {
    const data = localStorage.getItem(weatherKey);
    return data;
  },
};

module.exports = Storage;
