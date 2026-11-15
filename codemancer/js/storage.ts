interface LocalStorage {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
  length: number;
  clear: () => void;
  key: (index: number) => string | null;
}

// Each cached response uses three keys: value, expire time, and version
export const serverCacheKeys = 3 * 1000;

/**
 * In-memory localStorage replacement for Node that evicts the least recently
 * used keys so caching arbitrary coordinates cannot grow memory unbounded.
 **/
export class LRUStorage implements LocalStorage {
  #items = new Map<string, string>();
  #capacity: number;

  constructor(capacity: number) {
    this.#capacity = capacity;
  }

  get length(): number {
    return this.#items.size;
  }

  setItem(key: string, value: any): void {
    this.#items.delete(key);
    this.#items.set(key, String(value));
    while (this.#items.size > this.#capacity) {
      this.#items.delete(this.#items.keys().next().value as string);
    }
  }

  getItem(key: string): string | null {
    const value = this.#items.get(key);
    if (value === undefined) {
      return null;
    }
    this.#items.delete(key);
    this.#items.set(key, value);
    return value;
  }

  removeItem(key: string): void {
    this.#items.delete(key);
  }

  clear(): void {
    this.#items.clear();
  }

  key(index: number): string | null {
    return Array.from(this.#items.keys())[index] ?? null;
  }
}

let localStorage: LocalStorage;
if(typeof window === 'undefined') {
  localStorage = new LRUStorage(serverCacheKeys);
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

  static clear(): void {
    localStorage.clear();
  };

  static expireKey(key: string): string {
    return key + 'Time';
  };

  static versionKey(key: string): string {
    return key + 'Version';
  };
};

export default Storage;
