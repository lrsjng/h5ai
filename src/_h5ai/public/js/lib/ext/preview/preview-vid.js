const {each, includes, compact, dom} = require('../../util');
const {win} = require('../../globals');
const event = require('../../core/event');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    types: []
}, allsettings['preview-vid']);

const preloadVideo = (src, callback) => {
    const $video = dom('<video/>')
        .on('loadedmetadata', () => {
            callback($video);
            // win.setTimeout(() => {callback($video);}, 1000); // for testing
        })
        .attr('autoplay', 'autoplay')
        .attr('controls', 'controls')
        .attr('src', src);
};

const onEnter = (items, idx) => {
    const currentItems = items;
    let currentIdx = idx;
    let currentItem = items[idx];

    const onAdjustSize = () => {
        const $content = dom('#pv-content');
        const $vid = dom('#pv-vid-video');

        const contentW = $content[0].offsetWidth;
        const contentH = $content[0].offsetHeight;
        const vidW = ($vid[0] || {}).offsetWidth;
        const vidH = ($vid[0] || {}).offsetHeight;

        if ($vid.length === 0) {
            return;
        }

        $vid.css({
            left: (contentW - vidW) * 0.5 + 'px',
            top: (contentH - vidH) * 0.5 + 'px'
        });

        const vidVW = $vid[0].videoWidth;
        const vidVH = $vid[0].videoHeight;

        preview.setLabels([
            currentItem.label,
            String(vidVW) + 'x' + String(vidVH),
            String((100 * vidW / vidVW).toFixed(0)) + '%'
        ]);
    };

    const onIdxChange = rel => {
        currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
        currentItem = currentItems[currentIdx];

        const spinnerTimeout = win.setTimeout(() => preview.showSpinner(true), 200);

        if (dom('#pv-vid-video').length) {
            dom('#pv-vid-video')[0].pause();
        }

        const updateMeta = () => {
            onAdjustSize();
            preview.setIndex(currentIdx + 1, currentItems.length);
            preview.setRawLink(currentItem.absHref);
        };

        const onReady = $preloadedContent => {
            win.clearTimeout(spinnerTimeout);
            preview.showSpinner(false);

            dom('#pv-content')
                .clr()
                .app($preloadedContent.attr('id', 'pv-vid-video'))
                .show();
            updateMeta();
        };

        preloadVideo(currentItem.absHref, onReady);
    };

    onIdxChange(0);
    preview.setOnIndexChange(onIdxChange);
    preview.setOnAdjustSize(onAdjustSize);
    preview.enter();
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
