import {expect} from 'chai';
import sinon from 'sinon';
import {Client} from '@googlemaps/google-maps-services-js';

import getRollbar from '../codemancer/js/rollbar.js';
import {Location} from '../server/location.js';

const geocodeData = JSON.parse('{"results":[{"address_components":[{"long_name":"San Francisco","short_name":"SF","types":["locality","political"]},{"long_name":"California","short_name":"CA","types":["administrative_area_level_1","political"]},{"long_name":"United States","short_name":"US","types":["country","political"]}]}],"status":"OK"}');

// getLocation delegates to the Google Maps client; stubbing the client
// prototype keeps these tests off the network.
describe('Location.getLocation', function() {
  let reverseGeocode: sinon.SinonStub;
  let timezone: sinon.SinonStub;
  let rollbarError: sinon.SinonStub;
  beforeEach(function() {
    reverseGeocode = sinon.stub(Client.prototype, 'reverseGeocode');
    timezone = sinon.stub(Client.prototype, 'timezone');
    rollbarError = sinon.stub(getRollbar(), 'error');
  });
  afterEach(function() {
    reverseGeocode.restore();
    timezone.restore();
    rollbarError.restore();
  });

  it('resolves the display name and timezone on success', async function() {
    reverseGeocode.resolves({data: geocodeData});
    timezone.resolves({data: {status: 'OK', timeZoneId: 'America/Los_Angeles'}});
    const data = await Location.getLocation(37.8, -122.4);
    expect(data.lat).to.equal(37.8);
    expect(data.lng).to.equal(-122.4);
    expect(data.displayName).to.equal('San Francisco, CA');
    expect(data.timezone).to.equal('America/Los_Angeles');
  });

  it('leaves fields blank when the API reports a non-OK status', async function() {
    reverseGeocode.resolves({data: {status: 'ZERO_RESULTS', results: []}});
    timezone.resolves({data: {status: 'ZERO_RESULTS'}});
    const data = await Location.getLocation(37.8, -122.4);
    expect(data.displayName).to.equal('');
    expect(data.timezone).to.equal('');
  });

  it('leaves fields blank when the API requests reject', async function() {
    reverseGeocode.rejects(new Error('network down'));
    timezone.rejects(new Error('network down'));
    const data = await Location.getLocation(37.8, -122.4);
    expect(data.displayName).to.equal('');
    expect(data.timezone).to.equal('');
  });
});
