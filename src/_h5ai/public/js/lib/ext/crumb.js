const {each, dom} = require('../util');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const base = require('../view/base');


const settings = Object.assign({
    enabled: false
}, allsettings.crumb);
const crumbbarTpl = '<div id="crumbbar"></div>';
const crumbTpl =
        `<a class="crumb">
            <img class="sep" src="${resource.image('crumb')}" alt=">"/>
            <span class="label"></span>
        </a>`;
const pageHintTpl =
        `<img class="hint" src="${resource.icon('folder-page')}" alt="has index page"/>`;


const createHtml = item => {
    const $html = dom(crumbTpl);
    location.setLink($html, item);

    $html.find('.label').text(item.label);

    if (item.isCurrentFolder()) {
        $html.addCls('active');
    }

    if (!item.isManaged) {
        $html.app(dom(pageHintTpl));
    }

    item._$crumb = $html;
    $html[0]._item = item;

    return $html;
};

const onLocationChanged = item => {
    const $crumb = item._$crumb;
    const $crumbbar = dom('#crumbbar');

    if ($crumb && $crumb.parent()[0] === $crumbbar[0]) {
        $crumbbar.children().rmCls('active');
        $crumb.addCls('active');
    } else {
        $crumbbar.clr();
        each(item.getCrumb(), crumbItem => {
            $crumbbar.app(createHtml(crumbItem));
        });
    }
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    dom(crumbbarTpl).appTo(base.$flowbar);

    event.sub('location.changed', onLocationChanged);
};


init();
