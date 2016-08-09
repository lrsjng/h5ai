const {each, dom} = require('../util');
const server = require('../server');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');

const settings = Object.assign({
    enabled: false,
    type: 'php-tar',
    packageName: 'package',
    alwaysVisible: false
}, allsettings.download);
const tpl =
        `<div id="download" class="tool">
            <img src="${resource.image('download')}" alt="download"/>
        </div>`;
let selectedItems = [];
let $download;


const onSelection = items => {
    selectedItems = items.slice(0);
    if (selectedItems.length) {
        $download.show();
    } else if (!settings.alwaysVisible) {
        $download.hide();
    }
};

const onClick = () => {
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
        baseHref: location.getAbsHref(),
        hrefs: ''
    };

    each(selectedItems, (item, idx) => {
        query[`hrefs[${idx}]`] = item.absHref;
    });

    server.formRequest(query);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    $download = dom(tpl)
        .hide()
        .appTo('#toolbar')
        .on('click', onClick);

    if (settings.alwaysVisible) {
        $download.show();
    }

    event.sub('selection', onSelection);
};


init();
