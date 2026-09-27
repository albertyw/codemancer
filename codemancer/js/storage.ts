interface LocalStorage {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
  length: number;
  clear: () => void;
  key: (index: number) => string | null;
}

let localStorage: LocalStorage;
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
  static setExpirableData(key: string, value: any, version: string): void {
    if (process.env.ENV === 'development') {
      return;
    }
    localStorage.setItem(key, value);
    localStorage.setItem(Storage.expireKey(key), Date.now().toString());
    localStorage.setItem(Storage.versionKey(key), version);
  };

  static getExpirableData(key: string, expirationDuration: number, removeExpired: boolean, version: string): any {
    if (process.env.ENV === 'development') {
      return null;
    }
    if (localStorage.getItem(Storage.versionKey(key)) !== version) {
      Storage.removeData(key);
      return null;
    }
    const timestampString = localStorage.getItem(Storage.expireKey(key));
    const timestamp = parseInt(timestampString, 10);
    if (timestamp + expirationDuration < Date.now()) {
      if (removeExpired) {
        Storage.removeData(key);
      }
      return null;
    }
    const data = localStorage.getItem(key);
    return data;
  };

  static removeData(key: string): void {
    localStorage.removeItem(key);
    localStorage.removeItem(Storage.expireKey(key));
    localStorage.removeItem(Storage.versionKey(key));
  };

  static expireKey(key: string): string {
    return key + 'Time';
  };

  static versionKey(key: string): string {
    return key + 'Version';
  };
};

export default Storage;
