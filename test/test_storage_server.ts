import {expect} from 'chai';

import Storage, {LRUStorage} from '../codemancer/js/storage.js';

describe('LRUStorage', function() {
  it('stores and returns values', function() {
    const storage = new LRUStorage(2);
    storage.setItem('a', 1);
    expect(storage.getItem('a')).to.equal('1');
    expect(storage.getItem('missing')).to.equal(null);
    expect(storage.length).to.equal(1);
    expect(storage.key(0)).to.equal('a');
    expect(storage.key(1)).to.equal(null);
  });

  it('evicts the least recently used key past capacity', function() {
    const storage = new LRUStorage(2);
    storage.setItem('a', 'a');
    storage.setItem('b', 'b');
    storage.getItem('a');
    storage.setItem('c', 'c');
    expect(storage.getItem('a')).to.equal('a');
    expect(storage.getItem('b')).to.equal(null);
    expect(storage.getItem('c')).to.equal('c');
  });

  it('refreshes recency when a key is overwritten', function() {
    const storage = new LRUStorage(2);
    storage.setItem('a', 'a');
    storage.setItem('b', 'b');
    storage.setItem('a', 'a2');
    storage.setItem('c', 'c');
    expect(storage.getItem('a')).to.equal('a2');
    expect(storage.getItem('b')).to.equal(null);
  });

  it('removes and clears keys', function() {
    const storage = new LRUStorage(2);
    storage.setItem('a', 'a');
    storage.setItem('b', 'b');
    storage.removeItem('a');
    expect(storage.getItem('a')).to.equal(null);
    storage.clear();
    expect(storage.length).to.equal(0);
  });
});

describe('Storage on the server', function() {
  let env: string | undefined;
  beforeEach(function() {
    env = process.env.ENV;
    process.env.ENV = 'production';
  });
  afterEach(function() {
    Storage.clear();
    process.env.ENV = env;
  });

  it('caches data in memory', function() {
    Storage.setExpirableData('key', 'value', '1');
    expect(Storage.getExpirableData('key', 60 * 1000, false, '1')).to.equal('value');
  });
});
