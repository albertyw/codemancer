import {expect} from 'chai';

import {Location, targetLocation} from '../server/location.js';
const locationData = '{"plus_code":{"compound_code":"QHHV+CP SoMa, San Francisco, CA, USA","global_code":"849VQHHV+CP"},"results":[{"address_components":[{"long_name":"991","short_name":"991","types":["street_number"]},{"long_name":"Folsom Street","short_name":"Folsom St","types":["route"]},{"long_name":"SoMa","short_name":"SoMa","types":["neighborhood","political"]},{"long_name":"San Francisco","short_name":"SF","types":["locality","political"]},{"long_name":"San Francisco County","short_name":"San Francisco County","types":["administrative_area_level_2","political"]},{"long_name":"California","short_name":"CA","types":["administrative_area_level_1","political"]},{"long_name":"United States","short_name":"US","types":["country","political"]},{"long_name":"94107","short_name":"94107","types":["postal_code"]},{"long_name":"1020","short_name":"1020","types":["postal_code_suffix"]}],"formatted_address":"991 Folsom St, San Francisco, CA 94107, USA","geometry":{"location":{"lat":37.7785325,"lng":-122.405463},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":37.77988148029149,"lng":-122.4041140197085},"southwest":{"lat":37.77718351970849,"lng":-122.4068119802915}}},"place_id":"ChIJk-BzoYGAhYARzxzSX__2Tc8","plus_code":{"compound_code":"QHHV+CR SoMa, San Francisco, CA, United States","global_code":"849VQHHV+CR"},"types":["street_address"]}],"status":"OK"}';

describe('targetLocation', function() {
  it('returns data', function() {
    expect(targetLocation.wfo).to.not.be.empty;
    expect(targetLocation.x).to.not.be.empty;
    expect(targetLocation.y).to.not.be.empty;
    expect(targetLocation.lat).to.be.a('number');
    expect(targetLocation.lng).to.be.a('number');
  });
});

describe('Location.parseDisplayName', function() {
  it('returns location', function() {
    const name = Location.parseDisplayName(JSON.parse(locationData));
    expect(name).to.equal('San Francisco, CA');
  });
  it('can return a location with length 2', function() {
    const tempLocationData = JSON.parse(locationData);
    tempLocationData.results[0].address_components = tempLocationData.results[0].address_components.slice(4);
    const name = Location.parseDisplayName(tempLocationData);
    expect(name).to.equal('CA, United States');
  });
});
