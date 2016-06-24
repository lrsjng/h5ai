const {win, jq, lo, marked, prism} = require('../globals');
const event = require('../core/event');
const allsettings = require('../core/settings');
const preview = require('./preview');


const settings = lo.extend({
    enabled: false,
    types: {}
}, allsettings['preview-txt']);
const tplText = '<pre id="pv-txt-text" class="highlighted"/>';
const tplMarkdown = '<div id="pv-txt-text" class="markdown"/>';
const spinnerThreshold = 200;
let spinnerTimeoutId;
let currentItems;
let currentIdx;
let currentItem;


function preloadText(item, callback) {
    jq.ajax({
        url: item.absHref,
        dataType: 'text'
    })
    .done(content => {
        callback(item, content);

        // for testing
        // win.setTimeout(function () { callback(item, content); }, 1000);
    })
    .fail((jqXHR, textStatus) => {
        callback(item, '[ajax error] ' + textStatus);
    });
}

function onAdjustSize() {
    const $content = jq('#pv-content');
    const $text = jq('#pv-txt-text');

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

    jq('#pv-content').hide();
    if (preview.isSpinnerVisible()) {
        preview.showSpinner(true, currentItem.icon);
    } else {
        win.clearTimeout(spinnerTimeoutId);
        spinnerTimeoutId = win.setTimeout(() => {
            preview.showSpinner(true, currentItem.icon);
        }, spinnerThreshold);
    }

    preloadText(currentItem, (item, textContent) => {
        if (item !== currentItem) {
            return;
        }

        const type = settings.types[currentItem.type];
        let $text;
        let $code;

        if (type === 'none') {
            $text = jq(tplMarkdown).text(textContent);
        } else if (type === 'fixed') {
            $text = jq(tplText).text(textContent);
        } else if (type === 'markdown') {
            $text = jq(tplMarkdown).html(marked(textContent));
        } else {
            $text = jq(tplText);
            $code = jq('<code/>').appendTo($text);

            if (textContent.length < 20000) {
                $code.empty().html(prism.highlight(textContent, prism.languages[type]));
            } else {
                $code.empty().text(textContent);
                win.setTimeout(() => {
                    $code.empty().html(prism.highlight(textContent, prism.languages[type]));
                }, 300);
            }
        }

        win.clearTimeout(spinnerTimeoutId);
        preview.showSpinner(false);
        jq('#pv-content')
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
    if (item.$view && lo.includes(lo.keys(settings.types), item.type)) {
        item.$view.find('a').on('click', ev => {
            ev.preventDefault();

            const matchedItems = lo.compact(lo.map(jq('#items .item'), el => {
                const matchedItem = el._item;
                return lo.includes(lo.keys(settings.types), matchedItem.type) ? matchedItem : null;
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
