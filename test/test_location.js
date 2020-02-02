const expect = require('chai').expect;
const sinon = require('sinon');

const Location = require('../codemancer/js/location').Location;
const Rollbar = require('../codemancer/js/rollbar');
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
  beforeEach(() => {
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.requests = [];
    this.xhr.onCreate = (xhr) => {
      this.requests.push(xhr);
    };
    localStorage.clear();
    sinon.spy(Rollbar, 'error');
  });
  afterEach(() => {
    this.xhr.restore();
    Rollbar.error.restore();
  });
  it('it returns a location name', (done) => {
    const promise = Location.getDisplayName(Location.targetLocation);
    expect(this.requests.length).to.equal(1);
    this.requests[0].respond(200, {}, JSON.stringify(locationData));
    promise.then((data) => {
      expect(data).to.equal('San Francisco, CA');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
  it('will log an error if the status is not ok', (done) => {
    const promise = Location.getDisplayName(Location.targetLocation);
    expect(this.requests.length).to.equal(1);
    this.requests[0].respond(200, {}, JSON.stringify({status: 'ERROR'}));
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
  it('will log an error if the xhr errors out', (done) => {
    const promise = Location.getDisplayName(Location.targetLocation);
    expect(this.requests.length).to.equal(1);
    this.requests[0].error();
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

describe('Location.parseDisplayName', () => {
  it('returns location', () => {
    const name = Location.parseDisplayName(locationData);
    expect(name).to.equal('San Francisco, CA');
  });
  it('can return a location with length 2', () => {
    const tempLocationData = locationData;
    tempLocationData.results[0].address_components = locationData.results[0].address_components.slice(4);
    const name = Location.parseDisplayName(locationData);
    expect(name).to.equal('CA, United States');
  });
});
