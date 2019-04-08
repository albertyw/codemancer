const expect = require('chai').expect;

const Location = require('../codemancer/js/location');
const locationData = require('./map_fixture.json');

describe('Location.targetLocation', () => {
  it('returns data', () => {
    expect(Location.targetLocation.wfo).to.not.be.empty;
    expect(Location.targetLocation.x).to.not.be.empty;
    expect(Location.targetLocation.y).to.not.be.empty;
    expect(Location.targetLocation.lat).to.be.a('number');
    expect(Location.targetLocation.lng).to.be.a('number');
  });
});

describe('Location.getDisplayName', () => {
  it('it returns a location name', (done) => {
    const promise = Location.getDisplayName(Location.targetLocation);
    promise.then((data) => {
      expect(data).to.equal('San Francisco, CA');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
});

describe('Location.parseDisplayName', () => {
  it('returns location', () => {
    const name = Location.parseDisplayName(locationData);
    expect(name).to.equal('San Francisco, CA');
  });
});
