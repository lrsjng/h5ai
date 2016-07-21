const lolight = require('lolight');
const marked = require('marked');
const {each, keys, includes, compact, dom} = require('../../util');
const {win} = require('../../globals');
const event = require('../../core/event');
const allsettings = require('../../core/settings');
const preview = require('./preview');


const XHR = win.XMLHttpRequest;
const settings = Object.assign({
    enabled: false,
    styles: {}
}, allsettings['preview-txt']);
const tplText = '<pre id="pv-txt-text" class="highlighted"/>';
const tplMarkdown = '<div id="pv-txt-text" class="markdown"/>';
const spinnerThreshold = 200;

let spinnerTimeoutId;
let currentItems;
let currentIdx;
let currentItem;


const requestTextContent = href => {
    return new Promise((resolve, reject) => {
        const xhr = new XHR();
        const callback = () => {
            if (xhr.readyState === XHR.DONE) {
                try {
                    resolve(xhr.responseText);
                } catch (err) {
                    reject(String(err));
                }
            }
        };

        xhr.open('GET', href, true);
        xhr.onreadystatechange = callback;
        xhr.send();
    });
};

const preloadText = (item, callback) => {
    requestTextContent(item.absHref)
        .then(content => {
            callback(item, content);

            // for testing
            // win.setTimeout(() => callback(item, content), 1000);
        })
        .catch(err => callback(item, '[ajax error] ' + err));
};

const onAdjustSize = () => {
    const $content = dom('#pv-content');
    const $text = dom('#pv-txt-text');

    if ($text.length) {
        $text[0].style.height = $content[0].offsetHeight - 16 + 'px';
    }
};

const onIdxChange = rel => {
    currentIdx = (currentIdx + rel + currentItems.length) % currentItems.length;
    currentItem = currentItems[currentIdx];

    preview.setLabels([
        currentItem.label,
        String(currentItem.size) + ' bytes'
    ]);
    preview.setIndex(currentIdx + 1, currentItems.length);
    preview.setRawLink(currentItem.absHref);

    dom('#pv-content').hide();
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

        const style = settings.styles[currentItem.type];
        let $text;

        if (style === 1) {
            $text = dom(tplText).text(textContent);
        } else if (style === 2) {
            $text = dom(tplMarkdown).html(marked(textContent));
        } else if (style === 3) {
            $text = dom(tplText);
            const $code = dom('<code/>').text(textContent).appTo($text);
            win.setTimeout(() => {
                lolight.el($code[0]);
            }, textContent.length < 20000 ? 0 : 500);
        } else {
            $text = dom(tplMarkdown).text(textContent);
        }

        win.clearTimeout(spinnerTimeoutId);
        preview.showSpinner(false);
        dom('#pv-content')
            .clr()
            .app($text)
            .show();
        onAdjustSize();
    });
};

const onEnter = (items, idx) => {
    currentItems = items;
    currentIdx = idx;
    currentItem = items[idx];
    preview.setOnIndexChange(onIdxChange);
    preview.setOnAdjustSize(onAdjustSize);
    preview.enter();
    onIdxChange(0);
};

const initItem = item => {
    if (item.$view && includes(keys(settings.styles), item.type)) {
        item.$view.find('a').on('click', ev => {
            ev.preventDefault();

            const matchedItems = compact(dom('#items .item').map(el => {
                const matchedItem = el._item;
                return includes(keys(settings.styles), matchedItem.type) ? matchedItem : null;
            }));

            onEnter(matchedItems, matchedItems.indexOf(item));
        });
    }
};

const onViewChanged = added => each(added, initItem);

const init = () => {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
};


init();
