/**
 *  When called, runOnload will call the onloadFunc when the window is loaded
 */
function runOnload(onloadFunc) {
    if(window.attachEvent) {
        window.attachEvent('onload', onloadFunc);
    } else {
        if(window.onload) {
            const currOnload = window.onload;
            const newOnload = function(evt) {
                currOnload(evt);
                onloadFunc(evt);
            };
            window.onload = newOnload;
        } else {
            window.onload = onloadFunc;
        }
    }
}
module.exports = {
    runOnload: runOnload,
};
