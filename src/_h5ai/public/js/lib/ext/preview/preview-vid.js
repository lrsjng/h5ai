const {each, dom} = require('../../util');
const event = require('../../core/event');
const allsettings = require('../../core/settings');
const preview = require('./preview');
const previewX = require('./preview-x');

const settings = Object.assign({
    enabled: false,
    types: []
}, allsettings['preview-vid']);
const tpl = '<video id="pv-content-vid"/>';

let state;

const onAdjustSize = () => {
    const el = dom('#pv-content-vid')[0];
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

    const elVW = el.videoWidth;
    const elVH = el.videoHeight;

    preview.setLabels([
        state.item.label,
        String(elVW) + 'x' + String(elVH),
        String((100 * elW / elVW).toFixed(0)) + '%'
    ]);
};

const loadVideo = item => {
    return new Promise(resolve => {
        const $el = dom(tpl)
            .on('loadedmetadata', () => resolve($el))
            // .attr('autoplay', 'autoplay')
            .attr('controls', 'controls')
            .attr('src', item.absHref);
    });
    // .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)));
};

const onEnter = (items, idx) => {
    state = previewX.pvState(items, idx, loadVideo, onAdjustSize);
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
