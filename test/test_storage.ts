import {expect} from 'chai';

import Storage from '../codemancer/js/storage.js';

describe('Storage.getExpirableData', function() {
  const key = 'test';
  const duration = 60 * 1000;
  let env: string | undefined;

  beforeEach(function() {
    env = process.env.ENV;
    process.env.ENV = 'test';
  });

  afterEach(function() {
    Storage.removeData(key);
    process.env.ENV = env;
  });

  it('returns data stored with the same version', function() {
    Storage.setExpirableData(key, 'value', '1');
    expect(Storage.getExpirableData(key, duration, false, '1')).to.equal('value');
  });

  it('removes data stored with a different version', function() {
    Storage.setExpirableData(key, 'value', '1');
    expect(Storage.getExpirableData(key, duration, false, '2')).to.equal(null);
    expect(window.localStorage.getItem(key)).to.equal(null);
    expect(window.localStorage.getItem(Storage.expireKey(key))).to.equal(null);
    expect(window.localStorage.getItem(Storage.versionKey(key))).to.equal(null);
  });

  it('returns null for data without a version', function() {
    window.localStorage.setItem(key, 'value');
    window.localStorage.setItem(Storage.expireKey(key), Date.now().toString());
    expect(Storage.getExpirableData(key, duration, false, '1')).to.equal(null);
  });

  it('keeps expired data unless asked to remove it', function() {
    Storage.setExpirableData(key, 'value', '1');
    window.localStorage.setItem(Storage.expireKey(key), '0');
    expect(Storage.getExpirableData(key, duration, false, '1')).to.equal(null);
    expect(window.localStorage.getItem(key)).to.equal('value');
    expect(Storage.getExpirableData(key, duration, true, '1')).to.equal(null);
    expect(window.localStorage.getItem(key)).to.equal(null);
  });
});
