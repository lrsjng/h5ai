const {win} = require('../globals');
const event = require('../core/event');
const location = require('../core/location');
const allsettings = require('../core/settings');


const settings = Object.assign({
    enabled: false,
    interval: 5000
}, allsettings.autorefresh);
let timeoutId = null;


function heartbeat() {
    location.refresh();
}

function before() {
    win.clearTimeout(timeoutId);
}

function after() {
    win.clearTimeout(timeoutId);
    timeoutId = win.setTimeout(heartbeat, settings.interval);
}

function init() {
    if (!settings.enabled) {
        return;
    }

    settings.interval = Math.max(1000, settings.interval);

    event.sub('location.beforeChange', before);
    event.sub('location.beforeRefresh', before);
    event.sub('location.changed', after);
    event.sub('location.refreshed', after);
}


init();
