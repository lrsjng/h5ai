modulejs.define('ext/preview-img', ['_', '$', 'core/settings', 'core/event', 'ext/preview', 'ext/thumbnails'], function (_, $, allsettings, event, preview, thumbnails) {

    var settings = _.extend({
            enabled: false,
            types: []
        }, allsettings['preview-img']);


    function timeout(delay, arg) {

        var $def = $.Deferred();
        var timer = setTimeout(function() { $def.resolve(arg); }, delay);
        $def.fail(function() { clearTimeout(timer); });
        return $def.promise({
            cancel: function() { $def.reject(arg); }
        });
    }

    function preloadImg(src) {

        var $def = $.Deferred();
        var $img = $('<img/>')
                        .one('load', function () {

                            $def.resolve($img);
                            // setTimeout(function () { callback($img); }, 1000); // for testing
                        })
                        .attr('src', src);
        return $def.promise();
    }

    function onEnter(items, idx) {

        var currentItems = items;
        var currentIdx = idx;
        var currentItem = items[idx];

        function onAdjustSize() {

            var $content = $('#pv-content');
            var $img = $('#pv-img-image');

            if ($img.length) {

                $img.css({
                    'left': '' + (($content.width()-$img.width())*0.5) + 'px',
                    'top': '' + (($content.height()-$img.height())*0.5) + 'px'
                });

                preview.setLabels([
                    currentItem.label,
                    '' + $img[0].naturalWidth + 'x' + $img[0].naturalHeight,
                    '' + (100 * $img.width() / $img[0].naturalWidth).toFixed(0) + '%'
                ]);
            }
        }

        function swapImg($img) {

            var container = $('#pv-content').empty()
                .append($img.attr('id', 'pv-img-image'))
                .filter(':hidden').fadeIn(200);

            // small timeout, so $img is visible and therefore $img.width is available
            var timer = timeout(10, $img);
            if (!container.length) {
                timer.cancel();
            }
            return timer.always(function($img) {

                onAdjustSize();

                preview.setIndex(currentIdx + 1, currentItems.length);
                preview.setLabels([
                    currentItem.label,
                    '' + $img[0].naturalWidth + 'x' + $img[0].naturalHeight,
                    '' + (100 * $img.width() / $img[0].naturalWidth).toFixed(0) + '%'
                ]);
                preview.setRawLink(currentItem.absHref);
            });
        }

        function onIdxChange(rel) {

            currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
            currentItem = currentItems[currentIdx];

            var spinnerTimeout = timeout(200).done(function () { preview.showSpinner(true); });
            thumbnails.requestSample('img', currentItem.absHref, 1000, 0)
            .then(function(absHref) { return preloadImg(absHref); })
            .then(function ($img) {

                spinnerTimeout.cancel();
                preview.showSpinner(false);

                return $('#pv-content').fadeOut(100).promise()
                    // propogate $img down handler chain
                    .then(function() { return $img; });
            }).then(swapImg)
            // now full size
            .then(function() { return preloadImg(currentItem.absHref); })
            .then(swapImg);
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
