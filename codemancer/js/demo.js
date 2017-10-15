var originalDate = Date;

mockDate = function() {
    var date = new Date();
    var timestep = date.getSeconds() + date.getMinutes() * 60;
    var hours = timestep % 24;
    date.setHours(hours);
    var minutes = 0;
    date.setMinutes(minutes);
    return date;
}

function startDemo() {
    Date = mockDate;
}

function stopDemo() {
    Date = originalDate;
}
