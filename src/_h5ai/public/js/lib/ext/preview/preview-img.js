const {dom} = require('../../util');
const server = require('../../server');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    size: null,
    types: []
}, allsettings['preview-img']);
const tpl = '<img id="pv-content-img"/>';

let state;

const updateGui = () => {
    const el = dom('#pv-content-img')[0];
    if (!el) {
        return;
    }

    preview.centerContent();

    const elW = el.offsetWidth;

    const labels = [state.item.label];
    if (!settings.size) {
        const elNW = el.naturalWidth;
        const elNH = el.naturalHeight;
        labels.push(String(elNW) + 'x' + String(elNH));
        labels.push(String((100 * elW / elNW).toFixed(0)) + '%');
    }
    preview.setLabels(labels);
};

const requestSample = href => {
    return server.request({
        action: 'get',
        thumbs: [{
            type: 'img',
            href,
            width: settings.size,
            height: 0
        }]
    }).then(json => {
        return json && json.thumbs && json.thumbs[0] ? json.thumbs[0] : null;
    });
};

const loadImage = item => {
    return Promise.resolve(item.absHref)
        .then(href => {
            return settings.size ? requestSample(href) : href;
        })
        .then(href => new Promise(resolve => {
            const $el = dom(tpl)
                .on('load', () => resolve($el))
                .attr('src', href);
        }));
};

const onEnter = (items, idx) => {
    state = preview.state(items, idx, loadImage, updateGui);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    preview.register(settings.types, onEnter);
};

init();
