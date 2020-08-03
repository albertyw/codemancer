import util = require('./util');

const refreshTime = parseInt(process.env.REFRESH_INTERVAL, 10);

// Reload the page once an hour
export = function pageRefresher(): number {
  setInterval(() => {
    util.requestPromise(location.href, 0)
      .then(() => {
        location.reload();
      }, () => {
        console.error('cannot refresh current page');
      });
  }, refreshTime);
  return refreshTime;
}
