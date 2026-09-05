import {expect} from 'chai';
import sinon from 'sinon';

import getRollbar from '../codemancer/js/rollbar.js';
import Storage from '../codemancer/js/storage.js';
import {Location, targetLocation} from '../codemancer/js/location.js';

const cachedLocation = {
  lat: 40.71, lng: -74.01,
  timezone: 'America/New_York',
  displayName: 'New York, NY',
};

describe('targetLocation', function() {
  it('returns data', function() {
    expect(targetLocation.lat).to.be.a('number');
    expect(targetLocation.lng).to.be.a('number');
  });
});

describe('Location.getLocation', function() {
  it('returns targetLocation by default', async function() {
    const loc = new Location();
    const data = await loc.getLocation();
    expect(data).to.equal(targetLocation);
  });
});

describe('Location.getLocation', function() {
  it('returns the cached location when one is stored', async function() {
    const getData = sinon.stub(Storage, 'getExpirableData').returns(JSON.stringify(cachedLocation));
    try {
      const loc = new Location();
      const data = await loc.getLocation();
      expect(data).to.deep.equal(cachedLocation);
    } finally {
      getData.restore();
    }
  });
});

describe('Location.loadLocation', function() {
  it('returns a Promise', function() {
    const loc = new Location();
    const result = loc.loadLocation();
    expect(result).to.be.instanceOf(Promise);
  });

  it('falls back to the cached location when geolocation is denied', async function() {
    const getData = sinon.stub(Storage, 'getExpirableData').returns(JSON.stringify(cachedLocation));
    const getCurrentPosition = sinon.stub(navigator.geolocation, 'getCurrentPosition')
      .callsFake((_success, error) => error?.(new Error('denied') as unknown as GeolocationPositionError));
    const rollbarError = sinon.stub(getRollbar(), 'error');
    try {
      const loc = new Location();
      const data = await loc.loadLocation();
      expect(data).to.deep.equal(cachedLocation);
    } finally {
      getData.restore();
      getCurrentPosition.restore();
      rollbarError.restore();
    }
  });

  it('falls back to targetLocation when there is no cached location', async function() {
    const getData = sinon.stub(Storage, 'getExpirableData').returns(null);
    const getCurrentPosition = sinon.stub(navigator.geolocation, 'getCurrentPosition')
      .callsFake((_success, error) => error?.(new Error('denied') as unknown as GeolocationPositionError));
    const rollbarError = sinon.stub(getRollbar(), 'error');
    try {
      const loc = new Location();
      const data = await loc.loadLocation();
      expect(data).to.equal(targetLocation);
    } finally {
      getData.restore();
      getCurrentPosition.restore();
      rollbarError.restore();
    }
  });
});
