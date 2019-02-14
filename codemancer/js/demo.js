const background = require('./background');

const originalUpdateBackgroundColorPeriod = background.updateBackgroundColorPeriod;
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
    window.AppDate = mockDate;
    background.updateBackgroundColorPeriod = 500;
    background.updateBackgroundColor();
}

function stopDemo() {
    window.AppDate = Date;
    background.updateBackgroundColorPeriod = originalUpdateBackgroundColorPeriod;
}

function toggleDemo() { // eslint-disable-line no-unused-vars
    if (demoOn) {
        stopDemo();
    } else {
        startDemo();
    }
    demoOn = !demoOn;
}

module.exports = {
    toggleDemo: toggleDemo,
};
