import {expect} from 'chai';
import sinon from 'sinon';

import {Location} from '../codemancer/js/location.js';
import getRollbar from '../codemancer/js/rollbar.js';
import * as util from '../codemancer/js/util.js';
const locationData = '{"displayName": "San Francisco, CA"}';

describe('Location.getLocation', function() {
  beforeEach(function() {
    Location.locationData = undefined;
    this.requestPromise = sinon.stub(util, 'requestPromise');
    localStorage.clear();
    sinon.spy(getRollbar(), 'error');
  });
  afterEach(function() {
    Location.locationData = undefined;
    this.requestPromise.restore();
    localStorage.clear();
    getRollbar().error.restore();
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
      expect(data).to.eql({});
      expect(getRollbar().error.calledOnce).to.be.true;
      expect(getRollbar().error.getCall(0).args[0]).to.equal('Failed to geocode');
      done();
    }, (error) => {
      expect.fail(error);
      done();
    });
  });
});
