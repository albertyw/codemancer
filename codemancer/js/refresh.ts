import getRollbar from './rollbar.js';
import { requestPromise } from './util.js';

const refreshTime = parseInt(process.env.REFRESH_INTERVAL, 10);

// Reload the page once an hour
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
