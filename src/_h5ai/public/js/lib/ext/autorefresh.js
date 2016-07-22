const event = require('../core/event');
const location = require('../core/location');
const allsettings = require('../core/settings');

const win = global.window;
const settings = Object.assign({
    enabled: false,
    interval: 5000
}, allsettings.autorefresh);
let timeoutId = null;


const heartbeat = () => {
    location.refresh();
};

const before = () => {
    win.clearTimeout(timeoutId);
};

const after = () => {
    win.clearTimeout(timeoutId);
    timeoutId = win.setTimeout(heartbeat, settings.interval);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    settings.interval = Math.max(1000, settings.interval);

    event.sub('location.beforeChange', before);
    event.sub('location.beforeRefresh', before);
    event.sub('location.changed', after);
    event.sub('location.refreshed', after);
};


init();
