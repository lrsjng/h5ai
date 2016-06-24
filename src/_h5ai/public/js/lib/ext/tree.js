const {each} = require('../lo');
const {jq} = require('../globals');
const event = require('../core/event');
const location = require('../core/location');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');
const util = require('../core/util');


const settings = Object.assign({
    enabled: false,
    show: true,
    maxSubfolders: 50,
    naturalSort: false,
    ignorecase: true
}, allsettings.tree);
const template =
        `<div class="item">
            <span class="indicator none">
                <img src="${resource.image('tree-indicator')}"/>
            </span>
            <a>
                <span class="icon"><img/></span>
                <span class="label"/>
            </a>
        </span>`;
const settingsTemplate =
        `<div class="block">
            <h1 class="l10n-tree">Tree</h1>
            <div id="view-tree" class="button view">
                <img src="${resource.image('tree-toggle')}" alt="view-tree"/>
            </div>
        </div>`;
const storekey = 'ext/tree';


function cmpFn(item1, item2) {
    let val1 = item1.label;
    let val2 = item2.label;

    if (settings.ignorecase) {
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
    }

    return settings.natural ? util.naturalCmpFn(val1, val2) : util.regularCmpFn(val1, val2);
}

function update(item) {
    const $html = jq(template);
    const $indicator = $html.find('.indicator');
    const $a = $html.find('a');
    const $img = $html.find('.icon img');
    const $label = $html.find('.label');

    $html.addClass(item.isFolder() ? 'folder' : 'file');
    $html[0]._item = item;

    location.setLink($a, item);
    $img.attr('src', resource.icon('folder'));
    $label.text(item.label);

    if (item.isFolder()) {
        const subfolders = item.getSubfolders();

        // indicator
        if (item.isManaged && !item.isContentFetched || subfolders.length) {
            $indicator.removeClass('none');

            if (item.isManaged && !item.isContentFetched) {
                $indicator.addClass('unknown');
            } else if (item.isContentVisible) {
                $indicator.addClass('open');
            } else {
                $indicator.addClass('close');
            }
        }

        // is it the current folder?
        if (item.isCurrentFolder()) {
            $html.addClass('active');
        }

        // does it have subfolders?
        if (subfolders.length) {
            subfolders.sort(cmpFn);

            const $ul = jq('<ul class="content"/>').appendTo($html);
            let counter = 0;
            each(subfolders, e => {
                counter += 1;
                if (counter <= settings.maxSubfolders) {
                    jq('<li/>').append(update(e)).appendTo($ul);
                }
            });
            if (subfolders.length > settings.maxSubfolders) {
                jq('<li class="summary">… ' + (subfolders.length - settings.maxSubfolders) + ' more subfolders</li>').appendTo($ul);
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

    if (item.elTree) {
        jq(item.elTree).replaceWith($html);
    }
    item.elTree = $html[0];

    return $html;
}

function createOnIndicatorClick() {
    function slide(item, $indicator, $content, down) {
        item.isContentVisible = down;
        $indicator.removeClass('open close').addClass(down ? 'open' : 'close');
        $content[down ? 'slideDown' : 'slideUp']();
    }

    return ev => {
        let $indicator = jq(ev.currentTarget);
        let $item = $indicator.closest('.item');
        const item = $item[0]._item;
        let $content = $item.find('> ul.content');

        if ($indicator.hasClass('unknown')) {
            item.fetchContent(() => {
                item.isContentVisible = false;

                $item = update(item);
                $indicator = $item.find('> .indicator');
                $content = $item.find('> ul.content');

                if (!$indicator.hasClass('none')) {
                    slide(item, $indicator, $content, true);
                }
            });
        } else if ($indicator.hasClass('open')) {
            slide(item, $indicator, $content, false);
        } else if ($indicator.hasClass('close')) {
            slide(item, $indicator, $content, true);
        }
    };
}

function fetchTree(item, callback) {
    item.isContentVisible = true;
    item.fetchContent(() => {
        if (item.parent) {
            fetchTree(item.parent, callback);
        } else {
            callback(item);
        }
    });
}

function updateSettings() {
    if (store.get(storekey)) {
        jq('#view-tree').addClass('active');
        jq('#tree').show();
    } else {
        jq('#view-tree').removeClass('active');
        jq('#tree').hide();
    }
}

function onLocationChanged(item) {
    fetchTree(item, root => {
        jq('#tree').append(update(root));
        updateSettings();
    });
}

function init() {
    if (!settings.enabled) {
        return;
    }

    jq('<div id="tree"/>')
        .appendTo('#mainrow')
        .on('click', '.indicator', createOnIndicatorClick());

    jq(settingsTemplate)
        .appendTo('#sidebar')
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
}


init();
