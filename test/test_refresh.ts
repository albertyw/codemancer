import {expect} from 'chai';
import axios from 'axios';
import sinon from 'sinon';

import getRollbar from '../codemancer/js/rollbar.js';
import pageRefresher, {
  backendIsLive,
  cancelRefresh,
  scheduleRefresh,
} from '../codemancer/js/refresh.js';

describe('pageRefresher', () => {
  afterEach(() => {
    cancelRefresh();
  });

  it('returns a refresh time', () => {
    const timer = pageRefresher();
    expect(timer).to.be.at.least(0);
  });
});

describe('scheduleRefresh', () => {
  let axiosGet: sinon.SinonStub;
  let rollbarError: sinon.SinonStub;

  beforeEach(() => {
    rollbarError = sinon.stub(getRollbar(), 'error');
  });

  afterEach(() => {
    cancelRefresh();
    axiosGet.restore();
    rollbarError.restore();
  });

  it('restarts the timer without reloading when the backend is not live', async () => {
    axiosGet = sinon.stub(axios, 'get').rejects(new Error('backend down'));
    const delay = scheduleRefresh(10);
    expect(delay).to.equal(10);
    // The page must not reload while the backend is down; instead the timer
    // restarts and the backend gets checked again.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(axiosGet.callCount).to.be.at.least(2);
    expect(rollbarError.called).to.equal(true);
  });
});

describe('backendIsLive', () => {
  let axiosGet: sinon.SinonStub;
  let rollbarError: sinon.SinonStub;

  beforeEach(() => {
    rollbarError = sinon.stub(getRollbar(), 'error');
  });

  afterEach(() => {
    axiosGet.restore();
    rollbarError.restore();
  });

  it('is true when the health check succeeds', async () => {
    axiosGet = sinon.stub(axios, 'get').resolves({data: {status: 'ok'}});
    expect(await backendIsLive()).to.equal(true);
    expect(axiosGet.calledWith('/health/')).to.equal(true);
    expect(rollbarError.called).to.equal(false);
  });

  it('is false and reports an error when the health check fails', async () => {
    axiosGet = sinon.stub(axios, 'get').rejects(new Error('backend down'));
    expect(await backendIsLive()).to.equal(false);
    expect(rollbarError.called).to.equal(true);
  });
});
