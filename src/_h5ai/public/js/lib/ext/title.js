const {map} = require('../lo');
const {win} = require('../globals');
const event = require('../core/event');
const allsettings = require('../core/settings');


const doc = win.document;
const settings = Object.assign({
    enabled: false
}, allsettings.title);

function onLocationChanged(item) {
    const labels = map(item.getCrumb(), i => i.label);
    let title = labels.join(' > ');

    if (labels.length > 1) {
        title = labels[labels.length - 1] + ' - ' + title;
    }

    doc.title = title;
}

function init() {
    if (!settings.enabled) {
        return;
    }

    event.sub('location.changed', onLocationChanged);
}

init();
