const {setTimeout, jQuery: jq, _: lo} = require('../win');
const event = require('../core/event');
const allsettings = require('../core/settings');
const preview = require('./preview');

const settings = lo.extend({
    enabled: false,
    types: []
}, allsettings['preview-vid']);

function preloadVideo(src, callback) {
    const $video = jq('<video/>')
        .one('loadedmetadata', () => {
            callback($video);
            // setTimeout(function () { callback($video); }, 1000); // for testing
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
        const $vid = jq('#pv-vid-video');

        if ($vid.length) {
            $vid.css({
                left: String(($content.width() - $vid.width()) * 0.5) + 'px',
                top: String(($content.height() - $vid.height()) * 0.5) + 'px'
            });

            preview.setLabels([
                currentItem.label,
                String($vid[0].videoWidth) + 'x' + String($vid[0].videoHeight),
                String((100 * $vid.width() / $vid[0].videoWidth).toFixed(0)) + '%'
            ]);
        }
    }

    function onIdxChange(rel) {
        currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
        currentItem = currentItems[currentIdx];

        const spinnerTimeout = setTimeout(() => preview.showSpinner(true), 200);

        if (jq('#pv-vid-video').length) {
            jq('#pv-vid-video')[0].pause();
        }

        function updateMeta() {
            onAdjustSize();
            preview.setIndex(currentIdx + 1, currentItems.length);
            preview.setRawLink(currentItem.absHref);
        }

        function swap(nuContent) {
            jq('#pv-content').empty().append(nuContent.attr('id', 'pv-vid-video')).fadeIn(200);
            // small timeout, so nuContent is visible and therefore its width is available
            setTimeout(updateMeta, 10);
        }

        function onReady($preloadedContent) {
            clearTimeout(spinnerTimeout);
            preview.showSpinner(false);

            jq('#pv-content').fadeOut(100, () => swap($preloadedContent));
        }

        preloadVideo(currentItem.absHref, onReady);
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
