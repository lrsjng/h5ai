const {each, dom} = require('../../util');
const server = require('../../server');
const event = require('../../core/event');
const allsettings = require('../../core/settings');
const preview = require('./preview');
const previewX = require('./preview-x');

const settings = Object.assign({
    enabled: false,
    size: null,
    types: []
}, allsettings['preview-img']);
const tpl = '<img id="pv-content-img"/>';

let state;

const onAdjustSize = () => {
    const el = dom('#pv-content-img')[0];
    if (!el) {
        return;
    }

    const elContent = dom('#pv-content')[0];
    const contentW = elContent.offsetWidth;
    const contentH = elContent.offsetHeight;
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    dom(el).css({
        left: (contentW - elW) * 0.5 + 'px',
        top: (contentH - elH) * 0.5 + 'px'
    });

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
            const $img = dom(tpl)
                .on('load', () => resolve($img))
                .attr('src', href);
        }));
        // .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
};

const onEnter = (items, idx) => {
    state = previewX.pvState(items, idx, loadImage, onAdjustSize);
};

const initItem = previewX.initItemFn(settings.types, onEnter);
const onViewChanged = added => each(added, initItem);

const init = () => {
    if (!settings.enabled) {
        return;
    }

    event.sub('view.changed', onViewChanged);
};

init();
