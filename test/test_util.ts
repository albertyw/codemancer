import {expect} from 'chai';

import * as util from '../codemancer/js/util.js';

describe('chainAccessor', () => {
  it('returns properties in an array', () => {
    const x = ['a', ['b', 'c']];
    expect(util.chainAccessor(x, [0])).to.equal('a');
    expect(util.chainAccessor(x, [1])).to.deep.equal(['b', 'c']);
    expect(util.chainAccessor(x, [1, 0])).to.equal('b');
  });
  it('returns properties in a map', () => {
    const x = {a: {b: 1, c: 2}};
    expect(util.chainAccessor(x, ['a'])).to.deep.equal({b: 1, c: 2});
    expect(util.chainAccessor(x, ['a', 'b'])).to.equal(1);
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

describe('unique', function() {
  it('should return a unique copy of the array', function() {
    const test = [1,2,2,3,3,4];
    expect(util.unique(test)).to.have.ordered.members([1,2,3,4]);
  });
});
