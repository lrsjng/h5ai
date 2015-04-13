modulejs.define('ext/preview-txt', ['_', '$', 'marked', 'prism', 'core/settings', 'core/event', 'ext/preview'], function (_, $, marked, prism, allsettings, event, preview) {

    var settings = _.extend({
            enabled: false,
            types: {}
        }, allsettings['preview-txt']);
    var templateText = '<pre id="pv-txt-text" class="highlighted"/>';
    var templateMarkdown = '<div id="pv-txt-text" class="markdown"/>';


    function preloadText(absHref, callback) {

        $.ajax({
                url: absHref,
                dataType: 'text'
            })
            .done(function (content) {

                callback(content);
                // setTimeout(function () { callback(content); }, 1000); // for testing
            })
            .fail(function (jqXHR, textStatus) {

                callback('[ajax error] ' + textStatus);
            });
    }

    function onEnter(items, idx) {

        var currentItems = items;
        var currentIdx = idx;
        var currentItem = items[idx];

        function onAdjustSize() {

            var $content = $('#pv-content');
            var $text = $('#pv-txt-text');

            if ($text.length) {

                $text.height($content.height() - 16);
            }
        }

        function onIdxChange(rel) {

            currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
            currentItem = currentItems[currentIdx];

            var spinnerTimeout = setTimeout(function () { preview.showSpinner(true); }, 200);

            preloadText(currentItem.absHref, function (textContent) {

                clearTimeout(spinnerTimeout);
                preview.showSpinner(false);

                $('#pv-content').fadeOut(100, function () {

                    var type = settings.types[currentItem.type];
                    var $text;
                    var $code;

                    if (type === 'none') {
                        $text = $(templateMarkdown).text(textContent);
                    } else if (type === 'fixed') {
                        $text = $(templateText).text(textContent);
                    } else if (type === 'markdown') {
                        $text = $(templateMarkdown).html(marked(textContent));
                    } else {
                        $text = $(templateText);
                        $code = $('<code/>').appendTo($text);

                        if (textContent.length < 20000) {
                            $code.empty().html(prism.highlight(textContent, prism.languages[type]));
                        } else {
                            $code.empty().text(textContent);
                            setTimeout(function () { $code.empty().html(prism.highlight(textContent, prism.languages[type])); }, 300);
                        }
                    }
                    $('#pv-content').empty().append($text).fadeIn(200);
                    onAdjustSize();

                    preview.setIndex(currentIdx + 1, currentItems.length);
                    preview.setLabels([
                        currentItem.label,
                        String(currentItem.size) + ' bytes'
                    ]);
                    preview.setRawLink(currentItem.absHref);
                });
            });
        }

        onIdxChange(0);
        preview.setOnIndexChange(onIdxChange);
        preview.setOnAdjustSize(onAdjustSize);
        preview.enter();
    }

    function initItem(item) {

        if (item.$view && _.indexOf(_.keys(settings.types), item.type) >= 0) {
            item.$view.find('a').on('click', function (event) {

                event.preventDefault();

                var matchedEntries = _.compact(_.map($('#items .item'), function (item) {

                    item = $(item).data('item');
                    return _.indexOf(_.keys(settings.types), item.type) >= 0 ? item : null;
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
