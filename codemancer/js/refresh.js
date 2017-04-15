// Reload the page once an hour
var version = "";
(function refreshPage(){
    var refreshTime = 1000 * 30;
    var nonce = Math.floor(Math.random() * 1000 * 1000);
    var url = "/version?nonce="+nonce;
    setTimeout(function(){
        $.get(
            url,
            function(data) {
                if (version === "") {
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
