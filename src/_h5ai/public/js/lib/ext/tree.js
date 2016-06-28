const {each, dom, regularCmp, naturalCmp} = require('../util');
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
        `<div class="item">
            <span class="indicator none">
                <img src="${resource.image('tree-indicator')}"/>
            </span>
            <a>
                <span class="icon"><img/></span>
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


const cmpFn = (item1, item2) => {
    let val1 = item1.label;
    let val2 = item2.label;

    if (settings.ignorecase) {
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
    }

    return settings.natural ? naturalCmp(val1, val2) : regularCmp(val1, val2);
};

const update = item => {
    const $html = dom(itemTpl);
    const $indicator = $html.find('.indicator');
    const $a = $html.find('a');
    const $img = $html.find('.icon img');
    const $label = $html.find('.label');

    $html.addCls(item.isFolder() ? 'folder' : 'file');
    $indicator.on('click', createOnIndicatorClick()); // eslint-disable-line no-use-before-define

    location.setLink($a, item);
    $img.attr('src', resource.icon('folder'));
    $label.text(item.label);

    if (item.isFolder()) {
        const subfolders = item.getSubfolders();

        // indicator
        if (item.isManaged && !item.isContentFetched || subfolders.length) {
            $indicator.rmCls('none');

            if (item.isManaged && !item.isContentFetched) {
                $indicator.addCls('unknown');
            } else if (item.isContentVisible) {
                $indicator.addCls('open');
            } else {
                $indicator.addCls('close');
            }
        }

        // is it the current folder?
        if (item.isCurrentFolder()) {
            $html.addCls('active');
        }

        // does it have subfolders?
        if (subfolders.length) {
            subfolders.sort(cmpFn);

            const $ul = dom('<ul class="content"></ul>').appTo($html);
            let counter = 0;
            each(subfolders, e => {
                counter += 1;
                if (counter <= settings.maxSubfolders) {
                    dom('<li></li>').app(update(e)).appTo($ul);
                }
            });
            if (subfolders.length > settings.maxSubfolders) {
                dom('<li class="summary">… ' + (subfolders.length - settings.maxSubfolders) + ' more subfolders</li>').appTo($ul);
            }
            if (!item.isContentVisible) {
                $ul.hide();
            }
        }

        // reflect folder status
        if (!item.isManaged) {
            $img.attr('src', resource.icon('folder-page'));
        }
    }

    if (item.$tree) {
        item.$tree.rpl($html);
    }

    item.$tree = $html;
    $html[0]._item = item;

    return $html;
};

const closestItem = el => {
    while (!el._item && el.parentNode) {
        el = el.parentNode;
    }
    return el._item;
};

const createOnIndicatorClick = () => {
    const slide = ($indicator, $content, down) => {
        const item = closestItem($indicator[0]);
        item.isContentVisible = down;
        $indicator.rmCls('open').rmCls('close').addCls(down ? 'open' : 'close');
        // $content[down ? 'slideDown' : 'slideUp']();
        $content[down ? 'show' : 'hide']();
    };

    return ev => {
        const item = closestItem(ev.target);
        let $item = item.$tree;
        let $indicator = dom($item.find('.indicator')[0]);
        let $content = dom($item.find('ul.content')[0]);

        if ($indicator.hasCls('unknown')) {
            item.fetchContent(() => {
                item.isContentVisible = false;

                $item = update(item);
                $indicator = dom($item.find('.indicator')[0]);
                $content = dom($item.find('ul.content')[0]);

                if (!$indicator.hasCls('none')) {
                    slide($indicator, $content, true);
                }
            });
        } else if ($indicator.hasCls('open')) {
            slide($indicator, $content, false);
        } else if ($indicator.hasCls('close')) {
            slide($indicator, $content, true);
        }
    };
};

const fetchTree = (item, callback) => {
    item.isContentVisible = true;
    item.fetchContent(() => {
        if (item.parent) {
            fetchTree(item.parent, callback);
        } else {
            callback(item);
        }
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
    fetchTree(item, root => {
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
