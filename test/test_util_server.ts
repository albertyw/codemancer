import {expect} from 'chai';
import express from 'express';

import * as util from '../server/util.js';

function makeRequest(query: Record<string, unknown>): express.Request {
  return {query} as unknown as express.Request;
}

describe('getAssetPaths', function() {
  let originalEnv: string | undefined;
  beforeEach(function() {
    originalEnv = process.env.ENV;
  });
  afterEach(function() {
    if (originalEnv === undefined) {
      delete process.env.ENV;
    } else {
      process.env.ENV = originalEnv;
    }
  });
  it('returns unhashed defaults in development', function() {
    process.env.ENV = 'development';
    const paths = util.getAssetPaths();
    expect(paths.MAIN_JS).to.equal('/dist/main.js');
    expect(paths.MAIN_CSS).to.equal('/dist/main.css');
  });
  it('falls back to defaults when the manifest is missing', function() {
    process.env.ENV = 'production';
    const paths = util.getAssetPaths();
    expect(paths.MAIN_JS).to.be.a('string');
    expect(paths.MAIN_CSS).to.be.a('string');
  });
});

describe('getSVGs', function() {
  it('reads the SVG files into strings', async function() {
    const svgs = await util.getSVGs();
    expect(svgs.github).to.be.a('string').and.not.be.empty;
    expect(svgs.toggledemo).to.be.a('string').and.not.be.empty;
    expect(svgs.location).to.be.a('string').and.not.be.empty;
  });
});

describe('getLatLngFromRequest', function() {
  it('parses and rounds latitude and longitude to 1 decimal place', function() {
    const req = makeRequest({latitude: '37.7785325', longitude: '-122.405463'});
    const [latitude, longitude] = util.getLatLngFromRequest(req);
    expect(latitude).to.equal(37.8);
    expect(longitude).to.equal(-122.4);
  });
  it('returns NaN when latitude is not a number', function() {
    const req = makeRequest({latitude: 'abc', longitude: '-122.4'});
    const [latitude, longitude] = util.getLatLngFromRequest(req);
    expect(latitude).to.be.NaN;
    expect(longitude).to.be.NaN;
  });
  it('returns NaN when longitude is not a number', function() {
    const req = makeRequest({latitude: '37.8', longitude: 'xyz'});
    const [latitude, longitude] = util.getLatLngFromRequest(req);
    expect(latitude).to.be.NaN;
    expect(longitude).to.be.NaN;
  });
  it('returns NaN when the query params are missing', function() {
    const req = makeRequest({});
    const [latitude, longitude] = util.getLatLngFromRequest(req);
    expect(latitude).to.be.NaN;
    expect(longitude).to.be.NaN;
  });
});
