const {each, includes, compact, dom} = require('../util');
const {win} = require('../globals');
const event = require('../core/event');
const format = require('../core/format');
const allsettings = require('../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    types: []
}, allsettings['preview-aud']);

const preloadAudio = (src, callback) => {
    const $audio = dom('<audio/>')
        .on('loadedmetadata', () => callback($audio))
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
        const $audio = dom('#pv-aud-audio');

        if ($audio.length) {
            const contentW = $content[0].offsetWidth;
            const contentH = $content[0].offsetHeight;
            const audioW = $audio[0].offsetWidth;
            const audioH = $audio[0].offsetHeight;

            $audio.css({
                left: (contentW - audioW) * 0.5 + 'px',
                top: (contentH - audioH) * 0.5 + 'px'
            });

            preview.setLabels([
                currentItem.label,
                format.formatDate($audio[0].duration * 1000, 'm:ss')
            ]);
        }
    };

    const onIdxChange = rel => {
        currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
        currentItem = currentItems[currentIdx];

        const spinnerTimeout = win.setTimeout(() => preview.showSpinner(true), 200);

        if (dom('#pv-aud-audio').length) {
            dom('#pv-aud-audio')[0].pause();
        }

        const updateMeta = () => {
            onAdjustSize();
            preview.setIndex(currentIdx + 1, currentItems.length);
            preview.setRawLink(currentItem.absHref);
        };

        const swap = nuContent => {
            dom('#pv-content').clr().app(nuContent.attr('id', 'pv-aud-audio')).show();
            updateMeta();
        };

        const onReady = $preloadedContent => {
            win.clearTimeout(spinnerTimeout);
            preview.showSpinner(false);

            dom('#pv-content').hide();
            swap($preloadedContent);
        };

        preloadAudio(currentItem.absHref, onReady);
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

const onViewChanged = added => each(added, initItem);

const init = () => {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
};

init();
