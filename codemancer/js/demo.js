var originalDate = Date;
var originalUpdateBackgroundColorPeriod = updateBackgroundColorPeriod;
var demoOn = false;

mockDate = function() {
    var date = new originalDate();
    var timestep = date.getSeconds() + date.getMinutes() * 60;
    var hours = timestep % 24;
    date.setHours(hours);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
}

function startDemo() {
    Date = mockDate;
    updateBackgroundColorPeriod = 500;
    updateBackgroundColor();
}

function stopDemo() {
    Date = originalDate;
    updateBackgroundColorPeriod = originalUpdateBackgroundColorPeriod;
}

function toggleDemo() {
    if (demoOn) {
        stopDemo();
    } else {
        startDemo();
    }
    demoOn = !demoOn;
}
