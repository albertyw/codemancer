const localStorage = window.localStorage;

const Storage = {
  setExpirableData: function setExpirableData(key, value) {
    localStorage.setItem(key, value);
    const expireKey = Storage.expireKey(key);
    const timestamp = Date.now().toString();
    localStorage.setItem(expireKey, timestamp);
  },

  getExpirableData: function getExpirableData(key, expirationDuration, removeExpired) {
    const expireKey = Storage.expireKey(key);
    const timestampString = localStorage.getItem(expireKey);
    const timestamp = parseInt(timestampString, 10);
    if (timestamp + expirationDuration < Date.now() && removeExpired) {
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
