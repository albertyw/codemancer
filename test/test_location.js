const expect = require('chai').expect;
const sinon = require('sinon');

const Location = require('../codemancer/js/location').Location;
const Rollbar = require('../codemancer/js/rollbar');
const util = require('../codemancer/js/util');
const locationData = JSON.stringify(require('./map_fixture.json'));

describe('Location.targetLocation', function() {
  it('returns data', function() {
    expect(Location.targetLocation.wfo).to.not.be.empty;
    expect(Location.targetLocation.x).to.not.be.empty;
    expect(Location.targetLocation.y).to.not.be.empty;
    expect(Location.targetLocation.lat).to.be.a('number');
    expect(Location.targetLocation.lng).to.be.a('number');
  });
});

describe('Location.getDisplayName', function() {
  beforeEach(function() {
    this.requestPromise = sinon.stub(util, 'requestPromise');
    localStorage.clear();
    sinon.spy(Rollbar, 'error');
  });
  afterEach(function() {
    this.requestPromise.restore();
    localStorage.clear();
    Rollbar.error.restore();
  });
  it('it returns a location name', function(done) {
    this.requestPromise.resolves(JSON.parse(locationData));
    const promise = Location.getDisplayName(Location.targetLocation);
    promise.then((data) => {
      expect(data).to.equal('San Francisco, CA');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
  it('will log an error if the status is not ok', function(done) {
    this.requestPromise.resolves({status: 'ERROR'});
    const promise = Location.getDisplayName(Location.targetLocation);
    promise.then((data) => {
      expect(data).to.equal('');
      expect(Rollbar.error.calledOnce).to.be.true;
      expect(Rollbar.error.getCall(0).args[0]).to.equal('Failed to geocode');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
  it('will log an error if the xhr errors out', function(done) {
    this.requestPromise.resolves(function() { throw 'error'; });
    const promise = Location.getDisplayName(Location.targetLocation);
    promise.then((data) => {
      expect(data).to.equal('');
      expect(Rollbar.error.calledOnce).to.be.true;
      expect(Rollbar.error.getCall(0).args[0]).to.equal('Failed to geocode');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
});

describe('Location.parseDisplayName', function() {
  it('returns location', function() {
    const name = Location.parseDisplayName(JSON.parse(locationData));
    expect(name).to.equal('San Francisco, CA');
  });
  it('can return a location with length 2', function() {
    let tempLocationData = JSON.parse(locationData);
    tempLocationData.results[0].address_components = tempLocationData.results[0].address_components.slice(4);
    const name = Location.parseDisplayName(tempLocationData);
    expect(name).to.equal('CA, United States');
  });
});
