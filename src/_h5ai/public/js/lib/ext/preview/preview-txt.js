const lolight = require('lolight');
const marked = require('marked');
const {keys, dom} = require('../../util');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const win = global.window;
const XHR = win.XMLHttpRequest;
const settings = Object.assign({
    enabled: false,
    styles: {}
}, allsettings['preview-txt']);
const preTpl = '<pre id="pv-content-txt"></pre>';
const divTpl = '<div id="pv-content-txt"></div>';

const updateGui = () => {
    const el = dom('#pv-content-txt')[0];
    if (!el) {
        return;
    }

    const container = dom('#pv-container')[0];
    el.style.height = container.offsetHeight + 'px';

    preview.setLabels([
        preview.item.label,
        preview.item.size + ' bytes'
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

const load = item => {
    return requestTextContent(item.absHref)
        .catch(err => '[request failed] ' + err)
        .then(content => {
            const style = settings.styles[item.type];

            if (style === 1) {
                return dom(preTpl).text(content);
            } else if (style === 2) {
                return dom(divTpl).html(marked(content));
            } else if (style === 3) {
                const $code = dom('<code></code>').text(content);
                win.setTimeout(() => {
                    lolight.el($code[0]);
                }, content.length < 20000 ? 0 : 500);
                return dom(preTpl).app($code);
            }

            return dom(divTpl).text(content);
        });
};

const init = () => {
    if (settings.enabled) {
        preview.register(keys(settings.styles), load, updateGui);
    }
};

init();
