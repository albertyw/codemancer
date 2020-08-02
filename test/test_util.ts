import {expect} from require('chai');

import util = require('../codemancer/js/util');

describe('chainAccessor', () => {
  it('returns properties in an array', () => {
    const x = ['a', ['b', 'c']];
    expect(util.chainAccessor(x, [0]), 'a');
    expect(util.chainAccessor(x, [1]), ['b', 'c']);
    expect(util.chainAccessor(x, [1, 0]), 'b');
  });
  it('returns properties in a map', () => {
    const x = {a: {b: 1, c: 2}};
    expect(util.chainAccessor(x, ['a']), {b: 1, c: 2});
    expect(util.chainAccessor(x, ['a', 'b']), 1);
  });
});

describe('toggleDemo', () => {
  let demoStatus = util.toggleDemo();
  expect(demoStatus).to.be.true;
  demoStatus = util.toggleDemo();
  expect(demoStatus).to.be.false;
});

describe('getMockDate', () => {
  it('returns a normal date when demo is off', () => {
    const date = util.getMockDate();
    const realDate = new Date();
    const diff = realDate.getTime() - date.getTime();
    expect(diff).to.be.greaterThan(-1);
    expect(diff).to.be.lessThan(1000);
  });
  it('returns a mock date when demo is on', () => {
    const demoStatus = util.toggleDemo();
    expect(demoStatus).to.be.true;
    const date = util.getMockDate();
    expect(date.getHours()).to.be.greaterThan(-1);
    expect(date.getHours()).to.be.lessThan(24);
    expect(date.getMinutes()).to.equal(0);
    expect(date.getSeconds()).to.equal(0);

  });
});

describe('trimString', function() {
  it('should return a trimmed string', function() {
    const trimmedString = util.trimString(' asdf  ');
    expect(trimmedString).to.be.equal('asdf');
  });
});

describe('unique', function() {
  it('should return a unique copy of the array', function() {
    const test = [1,2,2,3,3,4];
    expect(util.unique(test)).to.have.ordered.members([1,2,3,4]);
  });
});
