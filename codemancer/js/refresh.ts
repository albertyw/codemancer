import getRollbar from './rollbar.js';
import { requestPromise } from './util.js';

const refreshTime = 1000 * 60 * 60;

// Reload the page once every refreshTime
export default function pageRefresher(): number {
  setInterval(() => {
    requestPromise(location.href, 0, 0)
      .then(() => {
        location.reload();
      }, () => {
        getRollbar().error('cannot refresh current page');
      });
  }, refreshTime);
  return refreshTime;
}
