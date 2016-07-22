const {each, dom} = require('../../util');
const event = require('../../core/event');
const format = require('../../core/format');
const allsettings = require('../../core/settings');
const preview = require('./preview');
const previewX = require('./preview-x');

const settings = Object.assign({
    enabled: false,
    types: []
}, allsettings['preview-aud']);
const tpl = '<audio id="pv-content-aud"/>';

let state;

const onAdjustSize = () => {
    const el = dom('#pv-content-aud')[0];
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

    preview.setLabels([
        state.item.label,
        format.formatDate(dom('#pv-content-aud')[0].duration * 1000, 'm:ss')
    ]);
};

const loadAudio = item => {
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
    state = previewX.pvState(items, idx, loadAudio, onAdjustSize);
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
