const {jq, lo} = require('../globals');
const event = require('../core/event');
const format = require('../core/format');
const location = require('../core/location');
const resource = require('../core/resource');
const store = require('../core/store');
const allsettings = require('../core/settings');
const content = require('./content');

const modes = ['details', 'grid', 'icons'];
const sizes = [20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400];
const settings = lo.extend({
    binaryPrefix: false,
    hideFolders: false,
    hideParentFolder: false,
    modes,
    setParentFolderLabels: false,
    sizes
}, allsettings.view);
const sortedSizes = settings.sizes.sort((a, b) => a - b);
const checkedModes = lo.intersection(settings.modes, modes);
const storekey = 'view';
const tplView =
        `<div id="view">
            <ul id="items" class="clearfix">
                <li class="header">
                    <a class="icon"/>
                    <a class="label" href="#"><span class="l10n-name"/></a>
                    <a class="date" href="#"><span class="l10n-lastModified"/></a>
                    <a class="size" href="#"><span class="l10n-size"/></a>
                </li>
            </ul>
            <div id="view-hint"/>
        </div>`;
const tplItem =
        `<li class="item">
            <a>
                <span class="icon square"><img/></span>
                <span class="icon landscape"><img/></span>
                <span class="label"/>
                <span class="date"/>
                <span class="size"/>
            </a>
        </li>`;
const $view = jq(tplView);
const $items = $view.find('#items');
const $hint = $view.find('#view-hint');


function cropSize(size, min, max) {
    return Math.min(max, Math.max(min, size));
}

function createStyles(size) {
    const dsize = cropSize(size, 20, 80);
    const gsize = cropSize(size, 40, 160);
    const isize = cropSize(size, 80, 1000);
    const ilsize = Math.round(isize * 4 / 3);
    const rules = [
        `#view.view-details.view-size-${size} .item .label {line-height: ${dsize + 14}px !important;}`,
        `#view.view-details.view-size-${size} .item .date {line-height: ${dsize + 14}px !important;}`,
        `#view.view-details.view-size-${size} .item .size {line-height: ${dsize + 14}px !important;}`,
        `#view.view-details.view-size-${size} .square {width: ${dsize}px !important; height: ${dsize}px !important;}`,
        `#view.view-details.view-size-${size} .square img {width: ${dsize}px !important; height: ${dsize}px !important;}`,
        `#view.view-details.view-size-${size} .label {margin-left: ${dsize + 32}px !important;}`,

        `#view.view-grid.view-size-${size} .item .label {line-height: ${gsize}px !important;}`,
        `#view.view-grid.view-size-${size} .square {width: ${gsize}px !important; height: ${gsize}px !important;}`,
        `#view.view-grid.view-size-${size} .square img {width: ${gsize}px !important; height: ${gsize}px !important;}`,

        `#view.view-icons.view-size-${size} .item {width: ${ilsize}px !important;}`,
        `#view.view-icons.view-size-${size} .landscape {width: ${ilsize}px !important; height: ${isize}px !important;}`,
        `#view.view-icons.view-size-${size} .landscape img {width: ${isize}px !important; height: ${isize}px !important;}`,
        `#view.view-icons.view-size-${size} .landscape .thumb {width: ${ilsize}px !important;}`
    ];

    return rules.join('\n');
}

function addCssStyles() {
    const styles = lo.map(sortedSizes, size => createStyles(size));
    styles.push(`#view .icon img {max-width: ${settings.maxIconSize}px; max-height: ${settings.maxIconSize}px;}`);
    jq('<style/>').text(styles.join('\n')).appendTo('head');
}

function set(mode, size) {
    const stored = store.get(storekey);

    mode = mode || stored && stored.mode;
    size = size || stored && stored.size;
    mode = lo.includes(settings.modes, mode) ? mode : settings.modes[0];
    size = lo.includes(settings.sizes, size) ? size : settings.sizes[0];
    store.put(storekey, {mode, size});

    lo.each(checkedModes, m => {
        if (m === mode) {
            $view.addClass('view-' + m);
        } else {
            $view.removeClass('view-' + m);
        }
    });

    lo.each(sortedSizes, s => {
        if (s === size) {
            $view.addClass('view-size-' + s);
        } else {
            $view.removeClass('view-size-' + s);
        }
    });

    event.pub('view.mode.changed', mode, size);
}

function getModes() {
    return checkedModes;
}

function getSizes() {
    return sortedSizes;
}

function getMode() {
    return store.get(storekey).mode;
}

function setMode(mode) {
    set(mode, null);
}

function getSize() {
    return store.get(storekey).size;
}

function setSize(size) {
    set(null, size);
}

function createHtml(item) {
    const $html = jq(tplItem);
    const $a = $html.find('a');
    const $iconImg = $html.find('.icon img');
    const $label = $html.find('.label');
    const $date = $html.find('.date');
    const $size = $html.find('.size');

    $html
        .addClass(item.isFolder() ? 'folder' : 'file')
        .data('item', item);

    location.setLink($a, item);

    $label.text(item.label).attr('title', item.label);
    $date.data('time', item.time).text(format.formatDate(item.time));
    $size.data('bytes', item.size).text(format.formatSize(item.size));
    item.icon = resource.icon(item.type);

    if (item.isFolder() && !item.isManaged) {
        $html.addClass('page');
        item.icon = resource.icon('folder-page');
    }

    if (item.isCurrentParentFolder()) {
        item.icon = resource.icon('folder-parent');
        if (!settings.setParentFolderLabels) {
            $label.addClass('l10n-parentDirectory');
        }
        $html.addClass('folder-parent');
    }
    $iconImg.attr('src', item.icon).attr('alt', item.type);

    item.$view = $html;

    return $html;
}

function onMouseenter(ev) {
    const item = jq(ev.currentTarget).closest('.item').data('item');
    event.pub('item.mouseenter', item);
}

function onMouseleave(ev) {
    const item = jq(ev.currentTarget).closest('.item').data('item');
    event.pub('item.mouseleave', item);
}

function checkHint() {
    const hasNoItems = $items.find('.item').not('.folder-parent').length === 0;

    if (hasNoItems) {
        $hint.show();
    } else {
        $hint.hide();
    }
}

function setItems(items) {
    const removed = lo.map($items.find('.item'), item => {
        return jq(item).data('item');
    });

    $items.find('.item').remove();

    lo.each(items, e => {
        $items.append(createHtml(e));
    });

    content.$el.scrollLeft(0).scrollTop(0);
    checkHint();
    event.pub('view.changed', items, removed);
}

function changeItems(add, remove) {
    lo.each(add, item => {
        createHtml(item).hide().appendTo($items).fadeIn(400);
    });

    lo.each(remove, item => {
        item.$view.fadeOut(400, () => {
            item.$view.remove();
        });
    });

    checkHint();
    event.pub('view.changed', add, remove);
}

function setHint(l10nKey) {
    $hint.removeClass().addClass('l10n-' + l10nKey);
    checkHint();
}

function onLocationChanged(item) {
    if (!item) {
        item = location.getItem();
    }

    const items = [];

    if (item.parent && !settings.hideParentFolder) {
        items.push(item.parent);
    }

    lo.each(item.content, child => {
        if (!(child.isFolder() && settings.hideFolders)) {
            items.push(child);
        }
    });

    setHint('empty');
    setItems(items);
}

function onLocationRefreshed(item, added, removed) {
    const add = [];

    lo.each(added, child => {
        if (!(child.isFolder() && settings.hideFolders)) {
            add.push(child);
        }
    });

    setHint('empty');
    changeItems(add, removed);
}

function init() {
    addCssStyles();
    set();

    $view.appendTo(content.$el);
    $hint.hide();

    format.setDefaultMetric(settings.binaryPrefix);

    $items
        .on('mouseenter', '.item a', onMouseenter)
        .on('mouseleave', '.item a', onMouseleave);

    event.sub('location.changed', onLocationChanged);
    event.sub('location.refreshed', onLocationRefreshed);
}


init();

module.exports = {
    $el: $view,
    $items,
    setItems,
    changeItems,
    setLocation: onLocationChanged,
    setHint,
    getModes,
    getMode,
    setMode,
    getSizes,
    getSize,
    setSize
};
