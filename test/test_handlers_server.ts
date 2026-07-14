import {expect} from 'chai';
import sinon from 'sinon';
import express from 'express';
import axios from 'axios';
import {Client} from '@googlemaps/google-maps-services-js';

import getRollbar from '../codemancer/js/rollbar.js';
// Keep webpack out of loadHandlers (only wired up when ENV === development).
process.env.ENV = 'production';
import {loadHandlers, loadTemplateVars} from '../server/handlers.js';

type Handler = (req: express.Request, res: FakeResponse) => void;

interface FakeResponse {
  statusCode: number;
  body?: unknown;
  headers: Record<string, string>;
  rendered?: {view: string; vars: unknown};
  status(code: number): FakeResponse;
  set(name: string, value: string): FakeResponse;
  json(obj: unknown): FakeResponse;
  render(view: string, vars: unknown): FakeResponse;
}

function getHandler(app: express.Express, path: string): Handler {
  const router = (app as any).router || (app as any)._router;
  const layer = router.stack.find((l: any) => l.route && l.route.path === path);
  return layer.route.stack[0].handle;
}

function makeResponse(): {res: FakeResponse; done: Promise<void>} {
  let resolveDone: () => void;
  const done = new Promise<void>((resolve) => { resolveDone = resolve; });
  const res: FakeResponse = {
    statusCode: 200,
    headers: {},
    status(code: number) { this.statusCode = code; return this; },
    set(name: string, value: string) { this.headers[name] = value; return this; },
    json(obj: unknown) { this.body = obj; resolveDone(); return this; },
    render(view: string, vars: unknown) { this.rendered = {view, vars}; resolveDone(); return this; },
  };
  return {res, done};
}

function makeRequest(query: Record<string, unknown>): express.Request {
  return {query} as unknown as express.Request;
}

describe('handlers', function() {
  let app: express.Express;
  beforeEach(function() {
    app = express();
    loadHandlers(app);
  });

  it('registers the expected routes', function() {
    for (const path of ['/', '/airquality/', '/weather/', '/location/', '/health/']) {
      expect(getHandler(app, path)).to.be.a('function');
    }
  });

  describe('health handler', function() {
    it('reports that the backend is live', async function() {
      const {res, done} = makeResponse();
      getHandler(app, '/health/')(makeRequest({}), res);
      await done;
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.deep.equal({status: 'ok'});
    });

    it('is not cacheable by a CDN', async function() {
      const {res, done} = makeResponse();
      getHandler(app, '/health/')(makeRequest({}), res);
      await done;
      expect(res.headers['Cache-Control']).to.equal('no-store, max-age=0');
      expect(res.headers['CDN-Cache-Control']).to.equal('no-store');
    });
  });

  describe('index handler', function() {
    it('renders the index template with the app template vars', async function() {
      app.locals.templateVars = {MAIN_JS: '/dist/main.js'};
      const {res, done} = makeResponse();
      getHandler(app, '/')(makeRequest({}), res);
      await done;
      expect(res.rendered?.view).to.equal('index');
      expect(res.rendered?.vars).to.deep.equal({MAIN_JS: '/dist/main.js'});
    });
  });

  describe('coordinate validation', function() {
    for (const path of ['/airquality/', '/weather/', '/location/']) {
      it(`returns 400 for ${path} when coordinates are missing`, async function() {
        const {res, done} = makeResponse();
        getHandler(app, path)(makeRequest({}), res);
        await done;
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.deep.equal({error: 'Invalid latitude or longitude'});
      });
    }
  });

  describe('airquality handler', function() {
    let axiosGet: sinon.SinonStub;
    afterEach(function() { axiosGet.restore(); });
    it('returns the air quality data on success', async function() {
      axiosGet = sinon.stub(axios, 'get').resolves({data: {aqi: 42}});
      const {res, done} = makeResponse();
      getHandler(app, '/airquality/')(makeRequest({latitude: '37.8', longitude: '-122.4'}), res);
      await done;
      expect(res.body).to.deep.equal({aqi: 42});
    });
    it('returns 500 when the upstream request fails', async function() {
      axiosGet = sinon.stub(axios, 'get').rejects(new Error('boom'));
      const {res, done} = makeResponse();
      getHandler(app, '/airquality/')(makeRequest({latitude: '37.8', longitude: '-122.4'}), res);
      await done;
      expect(res.statusCode).to.equal(500);
      expect(res.body).to.have.property('error');
    });
  });

  describe('weather handler', function() {
    let axiosGet: sinon.SinonStub;
    afterEach(function() { axiosGet.restore(); });
    it('returns the weather data on success', async function() {
      axiosGet = sinon.stub(axios, 'get').resolves({data: {temperature: 53}});
      const {res, done} = makeResponse();
      getHandler(app, '/weather/')(makeRequest({latitude: '37.8', longitude: '-122.4'}), res);
      await done;
      expect(res.body).to.deep.equal({temperature: 53});
    });
  });

  describe('location handler', function() {
    let reverseGeocode: sinon.SinonStub;
    let timezone: sinon.SinonStub;
    let rollbarError: sinon.SinonStub;
    beforeEach(function() {
      reverseGeocode = sinon.stub(Client.prototype, 'reverseGeocode').resolves({data: {status: 'ZERO_RESULTS', results: []}} as any);
      timezone = sinon.stub(Client.prototype, 'timezone').resolves({data: {status: 'OK', timeZoneId: 'America/Los_Angeles'}} as any);
      rollbarError = sinon.stub(getRollbar(), 'error');
    });
    afterEach(function() {
      reverseGeocode.restore();
      timezone.restore();
      rollbarError.restore();
    });
    it('returns the location data on success', async function() {
      const {res, done} = makeResponse();
      getHandler(app, '/location/')(makeRequest({latitude: '37.8', longitude: '-122.4'}), res);
      await done;
      expect(res.body).to.include({lat: 37.8, lng: -122.4, timezone: 'America/Los_Angeles'});
    });
  });
});

describe('loadTemplateVars', function() {
  it('populates the SVG and asset template vars', async function() {
    const app = express();
    loadTemplateVars(app);
    const deadline = Date.now() + 2000;
    while (app.locals.templateVars.GITHUB_SVG === undefined && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(app.locals.templateVars.GITHUB_SVG).to.be.a('string').and.not.be.empty;
    expect(app.locals.templateVars.MAIN_JS).to.be.a('string').and.not.be.empty;
    expect(app.locals.templateVars.MAIN_CSS).to.be.a('string').and.not.be.empty;
  });
});
