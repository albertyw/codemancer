import {expect} from 'chai';
import sinon = require('sinon');

import {Location} from '../codemancer/js/location';
import Rollbar = require('../codemancer/js/rollbar');
import util = require('../codemancer/js/util');
const locationData = '{"displayName": "San Francisco, CA"}';

describe('Location.targetLocation', function() {
  it('returns data', function() {
    expect(Location.targetLocation.wfo).to.not.be.empty;
    expect(Location.targetLocation.x).to.not.be.empty;
    expect(Location.targetLocation.y).to.not.be.empty;
    expect(Location.targetLocation.lat).to.be.a('number');
    expect(Location.targetLocation.lng).to.be.a('number');
  });
});

describe('Location.getLocation', function() {
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
    const promise = Location.getLocation();
    promise.then((data) => {
      expect(data.displayName).to.equal('San Francisco, CA');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
  it('will log an error if the xhr errors out', function(done) {
    this.requestPromise.rejects('error');
    const promise = Location.getLocation();
    promise.then((data) => {
      expect(data).to.equal(Location.targetLocation);
      expect(Rollbar.error.calledOnce).to.be.true;
      expect(Rollbar.error.getCall(0).args[0]).to.equal('Failed to geocode');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
});
