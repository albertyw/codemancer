import {expect} from 'chai';

import {Location, targetLocation} from '../codemancer/js/location.js';

describe('targetLocation', function() {
  it('returns data', function() {
    expect(targetLocation.wfo).to.not.be.empty;
    expect(targetLocation.x).to.not.be.empty;
    expect(targetLocation.y).to.not.be.empty;
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

describe('Location.loadLocation', function() {
  it('returns a Promise', function() {
    const loc = new Location();
    const result = loc.loadLocation();
    expect(result).to.be.instanceOf(Promise);
  });
});
