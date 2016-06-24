const {each} = require('../lo');
const {jq} = require('../globals');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const base = require('../view/base');


const settings = Object.assign({
    enabled: false
}, allsettings.crumb);
const crumbTemplate =
        `<a class="crumb">
            <img class="sep" src="${resource.image('crumb')}" alt=">"/>
            <span class="label"/>
        </a>`;
const pageHintTemplate =
        `<img class="hint" src="${resource.icon('folder-page')}" alt="has index page"/>`;
let $crumbbar;


function createHtml(item) {
    const $html = jq(crumbTemplate);
    $html[0]._item = item;
    item.elCrumb = $html[0];
    location.setLink($html, item);

    $html.find('.label').text(item.label);

    if (item.isCurrentFolder()) {
        $html.addClass('active');
    }

    if (!item.isManaged) {
        $html.append(jq(pageHintTemplate));
    }

    return $html;
}

function onLocationChanged(item) {
    const $crumb = jq(item.elCrumb);

    if ($crumb && $crumb.parent()[0] === $crumbbar[0]) {
        $crumbbar.children().removeClass('active');
        $crumb.addClass('active');
    } else {
        $crumbbar.empty();
        each(item.getCrumb(), crumbItem => {
            $crumbbar.append(createHtml(crumbItem));
        });
    }
}

function init() {
    if (!settings.enabled) {
        return;
    }

    $crumbbar = jq('<div id="crumbbar"/>').appendTo(base.$flowbar);

    event.sub('location.changed', onLocationChanged);
}


init();
