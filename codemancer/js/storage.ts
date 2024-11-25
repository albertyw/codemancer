const gitVersion = process.env.GIT_VERSION;

let localStorage = undefined;
if(typeof window === 'undefined') {
  localStorage = {
    setItem: function setItem() {
      // mock
    },
    getItem: function getItem() { return null; },
    removeItem: function removeItem() {
      //mock
    },
    length: 0,
    clear: function clear() {
      //mock
    },
    key: function key() {return null; },
  };
} else {
  localStorage = window.localStorage;
}

class Storage {
  static setExpirableData(key: string, value: any): void {
    if (process.env.ENV === 'development') {
      return;
    }
    localStorage.setItem(key, value);
    const expireKey = Storage.expireKey(key);
    const timestamp = Date.now().toString();
    localStorage.setItem(expireKey, timestamp);
  };

  static getExpirableData(key: string, expirationDuration: number, removeExpired: boolean): any {
    if (process.env.ENV === 'development') {
      return null;
    }
    Storage.checkVersion();
    const expireKey = Storage.expireKey(key);
    const timestampString = localStorage.getItem(expireKey);
    const timestamp = parseInt(timestampString, 10);
    if (timestamp + expirationDuration < Date.now()) {
      if (removeExpired) {
        localStorage.removeItem(key);
        localStorage.removeItem(expireKey);
      }
      return null;
    }
    const data = localStorage.getItem(key);
    return data;
  };

  static expireKey(key: string): string {
    return key + 'Time';
  };

  static checkVersion(): void {
    const version = localStorage.getItem('version');
    if (version !== gitVersion) {
      localStorage.clear();
      localStorage.setItem('version', gitVersion);
    }
  }
};

export default Storage;
