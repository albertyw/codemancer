const refreshTime = 60 * 60 * 1000;

// Reload the page once an hour
function pageRefresher(){
    setTimeout(() => {
        location.reload();
    }, refreshTime);
    return refreshTime;
}

module.exports = pageRefresher;
