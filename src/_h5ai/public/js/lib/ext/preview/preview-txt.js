const lolight = require('lolight');
const marked = require('marked');
const {each, keys, dom} = require('../../util');
const {win} = require('../../globals');
const event = require('../../core/event');
const allsettings = require('../../core/settings');
const preview = require('./preview');
const previewX = require('./preview-x');

const XHR = win.XMLHttpRequest;
const settings = Object.assign({
    enabled: false,
    styles: {}
}, allsettings['preview-txt']);
const tplText = '<pre id="pv-content-txt" class="highlighted"></pre>';
const tplMarkdown = '<div id="pv-content-txt" class="markdown"></div>';

let state;

const onAdjustSize = () => {
    const el = dom('#pv-content-txt')[0];
    if (!el) {
        return;
    }

    const elContent = dom('#pv-content')[0];

    dom(el).css({
        height: elContent.offsetHeight - 16 + 'px'
    });

    preview.setLabels([
        state.item.label,
        state.item.size + ' bytes'
    ]);
};

const requestTextContent = href => {
    return new Promise((resolve, reject) => {
        const xhr = new XHR();
        const callback = () => {
            if (xhr.readyState === XHR.DONE) {
                try {
                    resolve(xhr.responseText || '');
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

const loadText = item => {
    return requestTextContent(item.absHref)
        .catch(err => '[ajax error] ' + err)
        .then(content => {
            const style = settings.styles[state.item.type];
            let $text;

            if (style === 1) {
                $text = dom(tplText).text(content);
            } else if (style === 2) {
                $text = dom(tplMarkdown).html(marked(content));
            } else if (style === 3) {
                $text = dom(tplText);
                const $code = dom('<code/>').text(content).appTo($text);
                win.setTimeout(() => {
                    lolight.el($code[0]);
                }, content.length < 20000 ? 0 : 500);
            } else {
                $text = dom(tplMarkdown).text(content);
            }

            return $text;
        });
        // .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
};

const onEnter = (items, idx) => {
    state = previewX.pvState(items, idx, loadText, onAdjustSize);
};

const initItem = previewX.initItemFn(keys(settings.styles), onEnter);
const onViewChanged = added => each(added, initItem);

const init = () => {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
};

init();
