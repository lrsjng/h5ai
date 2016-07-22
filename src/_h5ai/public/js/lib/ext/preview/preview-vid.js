const {dom} = require('../../util');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    autoplay: true,
    types: []
}, allsettings['preview-vid']);
const tpl = '<video id="pv-content-vid"/>';

let state;

const updateGui = () => {
    const el = dom('#pv-content-vid')[0];
    if (!el) {
        return;
    }

    preview.centerContent();

    const elW = el.offsetWidth;
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
            .attr('controls', 'controls')
            .attr('src', item.absHref);

        if (settings.autoplay) {
            $el.attr('autoplay', 'autoplay');
        }
    });
};

const onEnter = (items, idx) => {
    state = preview.state(items, idx, loadVideo, updateGui);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    preview.register(settings.types, onEnter);
};

init();
