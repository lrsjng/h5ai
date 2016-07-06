const {each, includes, compact, dom} = require('../../util');
const {win} = require('../../globals');
const server = require('../../server');
const event = require('../../core/event');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    size: null,
    types: []
}, allsettings['preview-img']);
const spinnerThreshold = 200;
let spinnerTimeoutId;
let currentItems;
let currentIdx;
let currentItem;


const requestSample = href => {
    if (!settings.size) {
        return Promise.resolve(href);
    }

    return server.request({
        action: 'get',
        thumbs: [{
            type: 'img',
            href,
            width: settings.size,
            height: 0
        }]
    }).then(json => {
        return json && json.thumbs && json.thumbs[0] ? json.thumbs[0] : null;
    });
};

const preloadImage = (item, callback) => {
    return requestSample(item.absHref).then(src => {
        const $img = dom('<img/>')
            .on('load', () => {
                callback(item, $img);

                // for testing
                // win.setTimeout(() => callback(item, $img), 1000);
            })
            .attr('src', src);
    });
};

const onAdjustSize = () => {
    const $content = dom('#pv-content');
    const $img = dom('#pv-img-image');

    const contentW = $content[0].offsetWidth;
    const contentH = $content[0].offsetHeight;
    const imgW = ($img[0] || {}).offsetWidth;
    const imgH = ($img[0] || {}).offsetHeight;

    if ($img.length === 0) {
        return;
    }

    $img.css({
        left: (contentW - imgW) * 0.5 + 'px',
        top: (contentH - imgH) * 0.5 + 'px'
    });

    const labels = [currentItem.label];
    if (!settings.size) {
        const imgNW = $img[0].naturalWidth;
        const imgNH = $img[0].naturalHeight;
        labels.push(String(imgNW) + 'x' + String(imgNH));
        labels.push(String((100 * imgW / imgNW).toFixed(0)) + '%');
    }
    preview.setLabels(labels);
};

const onIdxChange = rel => {
    currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
    currentItem = currentItems[currentIdx];

    preview.setLabels([currentItem.label]);
    preview.setIndex(currentIdx + 1, currentItems.length);
    preview.setRawLink(currentItem.absHref);

    dom('#pv-content').hide();
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
        dom('#pv-content')
            .clr()
            .app(dom(preloadedImage).attr('id', 'pv-img-image'))
            .show();
        onAdjustSize();
    });
};

const onEnter = (items, idx) => {
    currentItems = items;
    currentIdx = idx;
    preview.setOnIndexChange(onIdxChange);
    preview.setOnAdjustSize(onAdjustSize);
    preview.enter();
    onIdxChange(0);
};

const initItem = item => {
    if (item.$view && includes(settings.types, item.type)) {
        item.$view.find('a').on('click', ev => {
            ev.preventDefault();

            const matchedItems = compact(dom('#items .item').map(el => {
                const matchedItem = el._item;
                return includes(settings.types, matchedItem.type) ? matchedItem : null;
            }));

            onEnter(matchedItems, matchedItems.indexOf(item));
        });
    }
};

const onViewChanged = added => {
    each(added, initItem);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
};


init();
