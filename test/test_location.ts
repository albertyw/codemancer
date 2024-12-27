import {expect} from 'chai';
import sinon from 'sinon';

import {Location} from '../codemancer/js/location.js';
import {LocationData} from '../server/location.js';
import getRollbar from '../codemancer/js/rollbar.js';
import util from '../codemancer/js/util.js';
const locationData = '{"displayName": "San Francisco, CA"}';

describe('Location.getLocation', function() {
  beforeEach(function() {
    this.location = new Location();
    this.requestPromise = sinon.stub(util, 'requestPromise');
    localStorage.clear();
    this.rollbarError = sinon.spy(getRollbar(), 'error');
  });
  afterEach(function() {
    this.requestPromise.restore();
    localStorage.clear();
    this.rollbarError.restore();
  });
  it('it returns a location name', function(done) {
    this.requestPromise.resolves(JSON.parse(locationData));
    const promise = this.location.getLocation();
    promise.then((data: LocationData) => {
      expect(data.displayName).to.equal('San Francisco, CA');
      done();
    }, (error: string) => {
      expect.fail(error);
      done();
    });
  });
  it('will log an error if the xhr errors out', function(done) {
    this.requestPromise.rejects('error');
    const promise = this.location.getLocation();
    promise.then((data: LocationData) => {
      expect(data).to.eql({});
      expect(this.rollbarError.calledOnce).to.be.true;
      expect(this.rollbarError.getCall(0).args[0]).to.equal('Failed to geocode');
      done();
    }, (error: string) => {
      expect.fail(error);
      done();
    });
  });
});
