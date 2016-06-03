const {win, jq, lo} = require('../globals');
const event = require('../core/event');
const format = require('../core/format');
const allsettings = require('../core/settings');
const preview = require('./preview');

const settings = lo.extend({
    enabled: false,
    types: []
}, allsettings['preview-aud']);

function preloadAudio(src, callback) {
    const $audio = jq('<audio/>')
        .one('loadedmetadata', () => {
            callback($audio);
            // win.setTimeout(function () { callback($img); }, 1000); // for testing
        })
        .attr('autoplay', 'autoplay')
        .attr('controls', 'controls')
        .attr('src', src);
}

function onEnter(items, idx) {
    const currentItems = items;
    let currentIdx = idx;
    let currentItem = items[idx];

    function onAdjustSize() {
        const $content = jq('#pv-content');
        const $audio = jq('#pv-aud-audio');

        if ($audio.length) {
            $audio.css({
                left: String(($content.width() - $audio.width()) * 0.5) + 'px',
                top: String(($content.height() - $audio.height()) * 0.5) + 'px'
            });

            preview.setLabels([
                currentItem.label,
                format.formatDate($audio[0].duration * 1000, 'm:ss')
            ]);
        }
    }

    function onIdxChange(rel) {
        currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
        currentItem = currentItems[currentIdx];

        const spinnerTimeout = win.setTimeout(() => preview.showSpinner(true), 200);

        if (jq('#pv-aud-audio').length) {
            jq('#pv-aud-audio')[0].pause();
        }

        function updateMeta() {
            onAdjustSize();
            preview.setIndex(currentIdx + 1, currentItems.length);
            preview.setRawLink(currentItem.absHref);
        }

        function swap(nuContent) {
            jq('#pv-content').empty().append(nuContent.attr('id', 'pv-vid-audio')).fadeIn(200);
            // small timeout, so nuContent is visible and therefore its width is available
            win.setTimeout(updateMeta, 10);
        }

        function onReady($preloadedContent) {
            win.clearTimeout(spinnerTimeout);
            preview.showSpinner(false);

            jq('#pv-content').fadeOut(100, () => swap($preloadedContent));
        }

        preloadAudio(currentItem.absHref, onReady);
    }

    onIdxChange(0);
    preview.setOnIndexChange(onIdxChange);
    preview.setOnAdjustSize(onAdjustSize);
    preview.enter();
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
