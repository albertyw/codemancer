const $ = require('jquery');

// Reload the page once an hour
let version = '';
(function refreshPage(){
    const refreshTime = 60 * 60 * 1000;
    const nonce = Math.floor(Math.random() * 1000 * 1000);
    const url = '/version?nonce='+nonce;
    setTimeout(function(){
        $.get(
            url,
            function(data) {
                if (version === '') {
                    version = data;
                    return;
                }
                if (version !== data) {
                    location.reload();
                }
            }
        );
        refreshPage();
    }, refreshTime);
}());
