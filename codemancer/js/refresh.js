const util = require('./util');

const refreshTime = parseInt(process.env.REFRESH_INTERVAL, 10);

// Reload the page once an hour
function pageRefresher(){
  setInterval(() => {
    util.request(location.href, () => {
      location.reload();
    }, () => {
      console.log('cannot refresh current page');
    }, 0);
  }, refreshTime);
  return refreshTime;
}

module.exports = pageRefresher;
