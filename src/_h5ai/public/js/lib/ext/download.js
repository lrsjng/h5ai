const {jq, lo} = require('../globals');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const server = require('../core/server');
const allsettings = require('../core/settings');

const settings = lo.extend({
    enabled: false,
    type: 'php-tar',
    packageName: 'package',
    alwaysVisible: false
}, allsettings.download);
const template =
        `<div id="download" class="tool">
            <img src="${resource.image('download')}" alt="download"/>
        </div>`;
let selectedItems = [];
let $download;


function onSelection(items) {
    selectedItems = items.slice(0);
    if (selectedItems.length) {
        $download.show();
    } else if (!settings.alwaysVisible) {
        $download.hide();
    }
}

function onClick() {
    const type = settings.type;
    let name = settings.packageName;
    const extension = type === 'shell-zip' ? 'zip' : 'tar';

    if (!name) {
        if (selectedItems.length === 1) {
            name = selectedItems[0].label;
        } else {
            name = location.getItem().label;
        }
    }

    const query = {
        action: 'download',
        as: name + '.' + extension,
        type,
        baseHref: location.getAbsHref()
    };

    lo.each(selectedItems, (item, idx) => {
        query['hrefs[' + idx + ']'] = item.absHref;
    });

    server.formRequest(query);
}

function init() {
    if (!settings.enabled) {
        return;
    }

    $download = jq(template)
        .hide()
        .appendTo('#toolbar')
        .on('click', onClick);

    if (settings.alwaysVisible) {
        $download.show();
    }

    event.sub('selection', onSelection);
}


init();
