modulejs.define('ext/preview-audio', ['_', '$', 'core/event', 'core/format', 'core/settings', 'ext/preview'], function (_, $, event, format, allsettings, preview) {
    var settings = _.extend({
        enabled: false,
        types: []
    }, allsettings['preview-aud']);

    function preloadAudio(src, callback) {
        var $audio = $('<audio/>')
            .one('loadedmetadata', function () {
                callback($audio);
                // setTimeout(function () { callback($img); }, 1000); // for testing
            })
            .attr('autoplay', 'autoplay')
            .attr('controls', 'controls')
            .attr('src', src);
    }

    function onEnter(items, idx) {
        var currentItems = items;
        var currentIdx = idx;
        var currentItem = items[idx];

        function onAdjustSize() {
            var $content = $('#pv-content');
            var $audio = $('#pv-aud-audio');

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

            var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

            if ($('#pv-aud-audio').length) {
                $('#pv-aud-audio')[0].pause();
            }

            function updateMeta() {
                onAdjustSize();
                preview.setIndex(currentIdx + 1, currentItems.length);
                preview.setRawLink(currentItem.absHref);
            }

            function swap(nuContent) {
                $('#pv-content').empty().append(nuContent.attr('id', 'pv-vid-audio')).fadeIn(200);
                // small timeout, so nuContent is visible and therefore its width is available
                setTimeout(updateMeta, 10);
            }

            function onReady($preloadedContent) {
                clearTimeout(spinnerTimeout);
                preview.showSpinner(false);

                $('#pv-content').fadeOut(100, function () {
                    swap($preloadedContent);
                });
            }

            preloadAudio(currentItem.absHref, onReady);
        }

        onIdxChange(0);
        preview.setOnIndexChange(onIdxChange);
        preview.setOnAdjustSize(onAdjustSize);
        preview.enter();
    }

    function initItem(item) {
        if (item.$view && _.indexOf(settings.types, item.type) >= 0) {
            item.$view.find('a').on('click', function (ev) {
                ev.preventDefault();

                var matchedItems = _.compact(_.map($('#items .item'), function (matchedItem) {
                    matchedItem = $(matchedItem).data('item');
                    return _.indexOf(settings.types, matchedItem.type) >= 0 ? matchedItem : null;
                }));

                onEnter(matchedItems, _.indexOf(matchedItems, item));
            });
        }
    }

    function onViewChanged(added) {
        _.each(added, initItem);
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        event.sub('view.changed', onViewChanged);
    }

    init();
});
