modulejs.define('ext/preview-audio', ['_', '$', 'core/settings', 'core/event', 'core/format', 'ext/preview'], function (_, $, allsettings, event, format, preview) {

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
            preloadAudio(currentItem.absHref, function ($preloadedAudio) {

                clearTimeout(spinnerTimeout);
                preview.showSpinner(false);

                $('#pv-content').fadeOut(100, function () {

                    $('#pv-content').empty().append($preloadedAudio.attr('id', 'pv-aud-audio')).fadeIn(200);

                    // small timeout, so $preloadedAudio is visible and therefore $preloadedAudio.width is available
                    setTimeout(function () {
                        onAdjustSize();

                        preview.setIndex(currentIdx + 1, currentItems.length);
                        preview.setRawLink(currentItem.absHref);
                    }, 10);
                });
            });
        }

        onIdxChange(0);
        preview.setOnIndexChange(onIdxChange);
        preview.setOnAdjustSize(onAdjustSize);
        preview.enter();
    }

    function initItem(item) {

        if (item.$view && _.indexOf(settings.types, item.type) >= 0) {
            item.$view.find('a').on('click', function (event) {

                event.preventDefault();

                var matchedEntries = _.compact(_.map($('#items .item'), function (item) {

                    item = $(item).data('item');
                    return _.indexOf(settings.types, item.type) >= 0 ? item : null;
                }));

                onEnter(matchedEntries, _.indexOf(matchedEntries, item));
            });
        }
    }

    function onLocationChanged(item) {

        _.each(item.content, initItem);
    }

    function onLocationRefreshed(item, added) {

        _.each(added, initItem);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationRefreshed);
    }


    init();
});
