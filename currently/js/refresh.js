// Reload the page once an hour
(function refreshPage(){
    var refreshTime = 1000 * 60 * 60;
    setTimeout(function(){
        location.reload();
    }, refreshTime);
}());
