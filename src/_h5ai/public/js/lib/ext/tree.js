const {each, dom, cmp, naturalCmp} = require('../util');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');


const settings = Object.assign({
    enabled: false,
    show: true,
    maxSubfolders: 50,
    naturalSort: false,
    ignorecase: true
}, allsettings.tree);
const itemTpl =
        `<div class="item folder">
            <span class="indicator">
                <img src="${resource.image('tree-indicator')}"/>
            </span>
            <a>
                <span class="icon"><img src="${resource.icon('folder')}"/></span>
                <span class="label"></span>
            </a>
        </span>`;
const settingsTpl =
        `<div class="block">
            <h1 class="l10n-tree">Tree</h1>
            <div id="view-tree" class="button view">
                <img src="${resource.image('tree-toggle')}" alt="view-tree"/>
            </div>
        </div>`;
const storekey = 'ext/tree';


const closestItem = el => {
    while (!el._item && el.parentNode) {
        el = el.parentNode;
    }
    return el._item;
};

const onIndicatorClick = ev => {
    const item = closestItem(ev.target);

    if (item._treeState === 'unknown') {
        item.fetchContent().then(() => {
            item._treeState = 'open';
            update(item); // eslint-disable-line no-use-before-define
        });
    } else if (item._treeState === 'open') {
        item._treeState = 'closed';
        item._$tree.rmCls('open').addCls('closed');
    } else if (item._treeState === 'closed') {
        item._treeState = 'open';
        item._$tree.rmCls('closed').addCls('open');
    }
};

const cmpItems = (item1, item2) => {
    let val1 = item1.label;
    let val2 = item2.label;

    if (settings.ignorecase) {
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
    }

    return settings.naturalSort ? naturalCmp(val1, val2) : cmp(val1, val2);
};

const update = item => {
    const subfolders = item.getSubfolders();
    const subLen = subfolders.length;
    const subMax = settings.maxSubfolders;
    const $html = dom(itemTpl);

    $html.find('.indicator').on('click', onIndicatorClick);
    $html.find('.label').text(item.label);
    location.setLink($html.find('a'), item);

    if (item.isCurrentFolder()) {
        $html.addCls('active');
    }

    if (!item.isManaged) {
        $html.find('.icon img').attr('src', resource.icon('folder-page'));
    }

    // indicator
    item._treeState = item._treeState || 'none';
    if (item.isManaged && !item.isContentFetched) {
        item._treeState = 'unknown';
    } else if (!subLen) {
        item._treeState = 'none';
    }
    $html.addCls(item._treeState);

    // subfolders
    if (subLen) {
        const $ul = dom('<div class="content"></div>').appTo($html);
        subfolders.sort(cmpItems);
        each(subfolders.slice(0, subMax), e => $ul.app(update(e)));
        if (subLen > subMax) {
            $ul.app(`<div class="summary">… ${subLen - subMax} more subfolders</div>`);
        }
    }

    if (item._$tree) {
        item._$tree.rpl($html);
    }

    item._$tree = $html;
    $html[0]._item = item;

    return $html;
};

const fetchTree = item => {
    item._treeState = 'open';
    return item.fetchContent().then(() => {
        if (item.parent) {
            return fetchTree(item.parent);
        }
        return item;
    });
};

const updateSettings = () => {
    if (store.get(storekey)) {
        dom('#view-tree').addCls('active');
        dom('#tree').show();
    } else {
        dom('#view-tree').rmCls('active');
        dom('#tree').hide();
    }
};

const onLocationChanged = item => {
    fetchTree(item).then(root => {
        dom('#tree').clr().app(update(root));
        updateSettings();
    });
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    dom('<div id="tree"></div>').hide().appTo('#mainrow');

    dom(settingsTpl)
        .appTo('#sidebar')
        .find('#view-tree')
        .on('click', ev => {
            store.put(storekey, !store.get(storekey));
            updateSettings();
            event.pub('resize');
            ev.preventDefault();
        });

    // ensure stored value is boolean, otherwise set default
    if (typeof store.get(storekey) !== 'boolean') {
        store.put(storekey, settings.show);
    }
    updateSettings();

    event.sub('location.changed', onLocationChanged);
};

init();
