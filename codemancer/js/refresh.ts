import axios from 'axios';

import getRollbar from './rollbar.js';

const refreshTime = 1000 * 60 * 60;
const healthURL = '/health/';

/**
 * Check whether the backend is up and able to serve the page
 **/
export function backendIsLive(): Promise<boolean> {
  return axios.get(healthURL).then(() => true, () => {
    getRollbar().error('cannot refresh current page; backend is not live');
    return false;
  });
}

let timerID: ReturnType<typeof setTimeout> | undefined;

export function cancelRefresh(): void {
  clearTimeout(timerID);
  timerID = undefined;
}

/**
 * Reload the page after refreshTime, but only if the backend is live.
 * If it is not live, restart the timer and check again later.
 **/
export function scheduleRefresh(delay: number = refreshTime): number {
  timerID = setTimeout(() => {
    backendIsLive().then((isLive) => {
      if (isLive) {
        location.reload();
      } else {
        scheduleRefresh(delay);
      }
    });
  }, delay);
  return delay;
}

export default function pageRefresher(): number {
  return scheduleRefresh();
}
