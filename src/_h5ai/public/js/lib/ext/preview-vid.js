modulejs.define('ext/preview-vid', ['_', '$', 'core/event', 'core/settings', 'ext/preview'], function (_, $, event, allsettings, preview) {
    var settings = _.extend({
        enabled: false,
        types: []
    }, allsettings['preview-vid']);

    function preloadVideo(src, callback) {
        var $video = $('<video/>')
            .one('loadedmetadata', function () {
                callback($video);
                // setTimeout(function () { callback($video); }, 1000); // for testing
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
            var $vid = $('#pv-vid-video');

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

            var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

            if ($('#pv-vid-video').length) {
                $('#pv-vid-video')[0].pause();
            }

            function updateMeta() {
                onAdjustSize();
                preview.setIndex(currentIdx + 1, currentItems.length);
                preview.setRawLink(currentItem.absHref);
            }

            function swap(nuContent) {
                $('#pv-content').empty().append(nuContent.attr('id', 'pv-vid-video')).fadeIn(200);
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

            preloadVideo(currentItem.absHref, onReady);
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
