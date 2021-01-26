const {dom} = require('../../util');
const allsettings = require('../../core/settings');
const preview = require('./preview');

preview.setControlType("vid")

const settings = Object.assign({
    enabled: false,
    autoplay: true,
    types: []
}, allsettings['preview-vid']);
const tpl = '<video id="pv-content-vid"/>';

const updateGui = () => {
    const el = dom('#pv-content-vid')[0];
    if (!el) {
        return;
    }

    const elW = el.offsetWidth;
    const elVW = el.videoWidth;
    const elVH = el.videoHeight;

    preview.setLabels([
        preview.item.label,
        String(elVW) + 'x' + String(elVH),
        String((100 * elW / elVW).toFixed(0)) + '%'
    ]);
};

const addUnloadFn = el => {
    el.unload = () => {
        el.pause();
        el.src = '';
        el.load();
    };
};

const load = item => {
    return new Promise(resolve => {
        const $el = dom(tpl)
            .on('loadedmetadata', () => resolve($el))
            .attr('controls', 'controls');
        if (settings.autoplay) {
            $el.attr('autoplay', 'autoplay');
        }
        addUnloadFn($el[0]);
        $el.attr('src', item.absHref);
    });
};

const init = () => {
    if (settings.enabled) {
        preview.register(settings.types, load, updateGui);
    }
};

init();
