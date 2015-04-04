modulejs.define('ext/preview-img', ['_', '$', 'core/settings', 'core/event', 'core/server', 'ext/preview'], function (_, $, allsettings, event, server, preview) {

    var settings = _.extend({
            enabled: false,
            size: null,
            types: []
        }, allsettings['preview-img']);
    var templateLoading = '<img id="pv-img-image" class="loading"/>';
    var spinnerThreshold = 200;
    var currentItems, currentIdx, currentItem;


    function requestSample(href, callback) {

        if (!settings.size) {
            callback(href);
            return;
        }

        server.request({
            action: 'getThumbHref',
            type: 'img',
            href: href,
            width: settings.size,
            height: 0
        }, function (json) {

            callback(json && json.code === 0 ? json.absHref : null);
        });
    }

    function showSpinner(item) {

        var timeoutId;

        function start() {

            $('#pv-content')
                .empty()
                .append($(templateLoading).attr('src', item.thumbSquare))
                .show();

            onAdjustSize();

            preview.setLabels([item.label]);
            preview.showSpinner(true);
        }

        function stop() {

            clearTimeout(timeoutId);
            preview.showSpinner(false);
        }

        timeoutId = setTimeout(start, spinnerThreshold);
        return stop;
    }

    function preloadImg(item, callback) {

        var hide = showSpinner(item);

        requestSample(item.absHref, function (src) {

            $('<img/>')
                .one('load', function (ev) {

                    hide();
                    callback(item, ev.target);

                    // for testing
                    // setTimeout(function () { hide(); callback(item, ev.target); }, 1000);
                })
                .attr('src', src);
        });
    }

    function onAdjustSize() {

        var $content = $('#pv-content');
        var $img = $('#pv-img-image');

        if ($img.length === 0) {
            return;
        }

        $img.css({
            left: ($content.width() - $img.width()) * 0.5,
            top: ($content.height() - $img.height()) * 0.5
        });

        var labels = [currentItem.label];
        if (!settings.size) {
            labels.push('' + $img[0].naturalWidth + 'x' + $img[0].naturalHeight);
            labels.push('' + (100 * $img.width() / $img[0].naturalWidth).toFixed(0) + '%');
        }
        preview.setLabels(labels);
    }

    function onIdxChange(rel) {

        currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
        currentItem = currentItems[currentIdx];

        preview.setIndex(currentIdx + 1, currentItems.length);
        preview.setRawLink(currentItem.absHref);

        preloadImg(currentItem, function (item, preloaded_img) {

            if (item !== currentItem) {
                return;
            }

            $('#pv-content')
                .empty()
                .append($(preloaded_img).attr('id', 'pv-img-image'))
                .show();
            onAdjustSize();
        });
    }

    function onEnter(items, idx) {

        currentItems = items;
        currentIdx = idx;
        onIdxChange(0);
        preview.setOnIndexChange(onIdxChange);
        preview.setOnAdjustSize(onAdjustSize);
        preview.enter();
    }

    function initItem(item) {

        if (item.$view && _.indexOf(settings.types, item.type) >= 0) {
            item.$view.find('a').on('click', function (ev) {

                ev.preventDefault();

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

    function onLocationRefreshed(item, added, removed) {

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
