const {win, jq, lo} = require('../globals');
const event = require('../core/event');
const server = require('../core/server');
const allsettings = require('../core/settings');
const preview = require('./preview');

const settings = lo.extend({
    enabled: false,
    size: null,
    types: []
}, allsettings['preview-img']);
const spinnerThreshold = 200;
let spinnerTimeoutId;
let currentItems;
let currentIdx;
let currentItem;


function requestSample(href, callback) {
    if (!settings.size) {
        callback(href);
        return;
    }

    server.request({
        action: 'get',
        thumbs: [{
            type: 'img',
            href,
            width: settings.size,
            height: 0
        }]
    }).then(json => {
        callback(json && json.thumbs && json.thumbs[0] ? json.thumbs[0] : null);
    });
}

function preloadImage(item, callback) {
    requestSample(item.absHref, src => {
        jq('<img/>')
            .one('load', ev => {
                callback(item, ev.target);

                // for testing
                // win.setTimeout(function () { callback(item, ev.target); }, 1000);
            })
            .attr('src', src);
    });
}

function onAdjustSize() {
    const $content = jq('#pv-content');
    const $img = jq('#pv-img-image');

    if ($img.length === 0) {
        return;
    }

    $img.css({
        left: ($content.width() - $img.width()) * 0.5,
        top: ($content.height() - $img.height()) * 0.5
    });

    const labels = [currentItem.label];
    if (!settings.size) {
        labels.push(String($img[0].naturalWidth) + 'x' + String($img[0].naturalHeight));
        labels.push(String((100 * $img.width() / $img[0].naturalWidth).toFixed(0)) + '%');
    }
    preview.setLabels(labels);
}

function onIdxChange(rel) {
    currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
    currentItem = currentItems[currentIdx];

    preview.setLabels([currentItem.label]);
    preview.setIndex(currentIdx + 1, currentItems.length);
    preview.setRawLink(currentItem.absHref);

    jq('#pv-content').hide();
    if (preview.isSpinnerVisible()) {
        preview.showSpinner(true, currentItem.thumbSquare);
    } else {
        win.clearTimeout(spinnerTimeoutId);
        spinnerTimeoutId = win.setTimeout(() => {
            preview.showSpinner(true, currentItem.thumbSquare);
        }, spinnerThreshold);
    }

    preloadImage(currentItem, (item, preloadedImage) => {
        if (item !== currentItem) {
            return;
        }

        win.clearTimeout(spinnerTimeoutId);
        preview.showSpinner(false);
        jq('#pv-content')
            .empty()
            .append(jq(preloadedImage).attr('id', 'pv-img-image'))
            .show();
        onAdjustSize();
    });
}

function onEnter(items, idx) {
    currentItems = items;
    currentIdx = idx;
    preview.setOnIndexChange(onIdxChange);
    preview.setOnAdjustSize(onAdjustSize);
    preview.enter();
    onIdxChange(0);
}

function initItem(item) {
    if (item.$view && lo.includes(settings.types, item.type)) {
        item.$view.find('a').on('click', ev => {
            ev.preventDefault();

            const matchedItems = lo.compact(lo.map(jq('#items .item'), matchedItem => {
                matchedItem = jq(matchedItem).data('item');
                return lo.includes(settings.types, matchedItem.type) ? matchedItem : null;
            }));

            onEnter(matchedItems, lo.indexOf(matchedItems, item));
        });
    }
}

function onViewChanged(added) {
    lo.each(added, initItem);
}

function init() {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
}


init();
