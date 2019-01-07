// Client ID and API key from the Developer Console
var CLIENT_ID = "51833028115-pss6t7ckon9v6qu4bu87sqemktjhp745.apps.googleusercontent.com";
var API_KEY = "AIzaSyBh1lCQdVjeVmeL5ewoEx7IgbG3Si3-rhM";

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById("authorize_button");
var signoutButton = document.getElementById("signout_button");
var calendarContent = document.getElementById("calendar-content");

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    }, function(error) {
        appendPre("Could not connect to Google Calendar");
        console.error(JSON.stringify(error, null, 2)); // eslint-disable-line
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = "none";
        signoutButton.style.display = "block";
        listUpcomingEvents();
    } else {
        authorizeButton.style.display = "block";
        signoutButton.style.display = "none";
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var textContent = document.createTextNode(message + "\n");
    calendarContent.appendChild(textContent);

    calendarContent.classList.remove("hidden");
}


/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user"s calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    const events = [];
    gapi.client.calendar.calendarlist.list({
    }).then(function(response) {
        const calendars = response.result.items;
        const calendarsWaiting = 0;
        for(let i=0; i<calendars.length; i++) {
            if(calendars[i].selected) {
                continue;
            }
            calendarsWaiting++;
            const calendarId = calendars[i].id;
            gapi.client.calendar.events.list({
                "calendarId": calendarId,
                "timeMin": (new Date()).toISOString(),
                "showDeleted": false,
                "singleEvents": true,
                "maxResults": 10,
                "orderBy": "startTime"
            }).then(function(response) {
                const calendarEvents = response.result.items;
                events.push(calendarEvents);
                calendarsWaiting--;
                if(calendarsWaiting <= 0) {
                    displayEvents(events);
                }
            });
        }
    });
}

function getFirstEvents(eventArrays, eventCount) {
    const events = [];
    let minTime = 'asdf';
    let minTimeCalendar = 0;
    while(events.length < eventCount) {
        for(let i=0; i<eventArrays.count; i++) {
            const currentDate = eventArrays[i].start.dateTime;
            if(currentDate < minTime) {
                minTime = currentDate;
                minTimeCalendar = i;
            }
        }
        if(minTime === 'z') {
            break;
        }
        events.push(eventArrays[minTimeCalendar].shift());
        eventCount++;
    }
    return events;
}

function displayEvents(eventArrays) {
    const events = getFirstEvents(eventArrays, 10);
    appendPre("Upcoming events:");

    if (events.length > 0) {
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            var when = event.start.dateTime;
            if (!when) {
                when = event.start.date;
            }
            appendPre(event.summary + " (" + when + ")");
        }
    } else {
        appendPre("No upcoming events found.");
    }
}

function runOnload(onloadFunc) {
    if(window.attachEvent) {
        window.attachEvent("onload", onloadFunc);
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

runOnload(handleClientLoad);
