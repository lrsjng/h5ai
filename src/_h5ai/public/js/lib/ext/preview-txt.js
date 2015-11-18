modulejs.define('ext/preview-txt', ['_', '$', 'marked', 'prism', 'core/event', 'core/settings', 'ext/preview'], function (_, $, marked, prism, event, allsettings, preview) {
    var settings = _.extend({
        enabled: false,
        types: {}
    }, allsettings['preview-txt']);
    var tplText = '<pre id="pv-txt-text" class="highlighted"/>';
    var tplMarkdown = '<div id="pv-txt-text" class="markdown"/>';
    var spinnerThreshold = 200;
    var spinnerTimeoutId;
    var currentItems;
    var currentIdx;
    var currentItem;


    function preloadText(item, callback) {
        $.ajax({
            url: item.absHref,
            dataType: 'text'
        })
        .done(function (content) {
            callback(item, content);

            // for testing
            // setTimeout(function () { callback(item, content); }, 1000);
        })
        .fail(function (jqXHR, textStatus) {
            callback(item, '[ajax error] ' + textStatus);
        });
    }

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

        preview.setLabels([
            currentItem.label,
            String(currentItem.size) + ' bytes'
        ]);
        preview.setIndex(currentIdx + 1, currentItems.length);
        preview.setRawLink(currentItem.absHref);

        $('#pv-content').hide();
        if (preview.isSpinnerVisible()) {
            preview.showSpinner(true, currentItem.icon);
        } else {
            clearTimeout(spinnerTimeoutId);
            spinnerTimeoutId = setTimeout(function () {
                preview.showSpinner(true, currentItem.icon);
            }, spinnerThreshold);
        }

        preloadText(currentItem, function (item, textContent) {
            if (item !== currentItem) {
                return;
            }

            var type = settings.types[currentItem.type];
            var $text;
            var $code;

            if (type === 'none') {
                $text = $(tplMarkdown).text(textContent);
            } else if (type === 'fixed') {
                $text = $(tplText).text(textContent);
            } else if (type === 'markdown') {
                $text = $(tplMarkdown).html(marked(textContent));
            } else {
                $text = $(tplText);
                $code = $('<code/>').appendTo($text);

                if (textContent.length < 20000) {
                    $code.empty().html(prism.highlight(textContent, prism.languages[type]));
                } else {
                    $code.empty().text(textContent);
                    setTimeout(function () { $code.empty().html(prism.highlight(textContent, prism.languages[type])); }, 300);
                }
            }

            clearTimeout(spinnerTimeoutId);
            preview.showSpinner(false);
            $('#pv-content')
                .empty()
                .append($text)
                .show();
            onAdjustSize();
        });
    }

    function onEnter(items, idx) {
        currentItems = items;
        currentIdx = idx;
        currentItem = items[idx];
        preview.setOnIndexChange(onIdxChange);
        preview.setOnAdjustSize(onAdjustSize);
        preview.enter();
        onIdxChange(0);
    }

    function initItem(item) {
        if (item.$view && _.indexOf(_.keys(settings.types), item.type) >= 0) {
            item.$view.find('a').on('click', function (ev) {
                ev.preventDefault();

                var matchedItems = _.compact(_.map($('#items .item'), function (matchedItem) {
                    matchedItem = $(matchedItem).data('item');
                    return _.indexOf(_.keys(settings.types), matchedItem.type) >= 0 ? matchedItem : null;
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
