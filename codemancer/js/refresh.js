const refreshTime = parseInt(process.env.REFRESH_INTERVAL, 10);

// Reload the page once an hour
function pageRefresher(){
  setTimeout(() => {
    location.reload();
  }, refreshTime);
  return refreshTime;
}

module.exports = pageRefresher;
