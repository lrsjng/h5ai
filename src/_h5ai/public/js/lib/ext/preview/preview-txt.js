const lolight = require('lolight');
const marked = require('marked');
const {keys, dom} = require('../../util');
const {win} = require('../../globals');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const XHR = win.XMLHttpRequest;
const settings = Object.assign({
    enabled: false,
    styles: {}
}, allsettings['preview-txt']);
const tplPre = '<pre id="pv-content-txt"></pre>';
const tplDiv = '<div id="pv-content-txt"></div>';

let state;

const updateGui = () => {
    const el = dom('#pv-content-txt')[0];
    if (!el) {
        return;
    }

    const container = dom('#pv-container')[0];
    el.style.height = container.offsetHeight - 16 + 'px';

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
        .catch(err => '[request failed] ' + err)
        .then(content => {
            const style = settings.styles[item.type];

            if (style === 1) {
                return dom(tplPre).text(content);
            } else if (style === 2) {
                return dom(tplDiv).html(marked(content));
            } else if (style === 3) {
                const $code = dom('<code></code>').text(content);
                win.setTimeout(() => {
                    lolight.el($code[0]);
                }, content.length < 20000 ? 0 : 500);
                return dom(tplPre).app($code);
            }

            return dom(tplDiv).text(content);
        });
};

const onEnter = (items, idx) => {
    state = preview.state(items, idx, loadText, updateGui);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    preview.register(keys(settings.styles), onEnter);
};

init();
