const originalUpdateBackgroundColorPeriod = updateBackgroundColorPeriod;
let demoOn = false;

const mockDate = function() {
    const date = new Date();
    const timestep = date.getSeconds() + date.getMinutes() * 60;
    const hours = timestep % 24;
    date.setHours(hours);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
};

function startDemo() {
    AppDate = mockDate;
    updateBackgroundColorPeriod = 500;
    updateBackgroundColor();
}

function stopDemo() {
    AppDate = Date;
    updateBackgroundColorPeriod = originalUpdateBackgroundColorPeriod;
}

function toggleDemo() { // eslint-disable-line no-unused-vars
    if (demoOn) {
        stopDemo();
    } else {
        startDemo();
    }
    demoOn = !demoOn;
}
