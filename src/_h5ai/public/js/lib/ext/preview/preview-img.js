const {dom} = require('../../util');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    types: []
}, allsettings['preview-img']);
const tpl = '<img id="pv-content-img"/>';

const updateGui = () => {
    const el = dom('#pv-content-img')[0];
    if (!el) {
        return;
    }

    const elW = el.offsetWidth;

    const labels = [preview.item.label];
    const elNW = el.naturalWidth;
    const elNH = el.naturalHeight;
    labels.push(String(elNW) + 'x' + String(elNH));
    labels.push(String((100 * elW / elNW).toFixed(0)) + '%');

    preview.setLabels(labels);
};

const load = item => {
    return Promise.resolve(item.absHref)
        .then(href => new Promise(resolve => {
            const $el = dom(tpl)
                .on('load', () => resolve($el))
                .attr('src', href);
        }));
};

const init = () => {
    if (settings.enabled) {
        preview.register(settings.types, load, updateGui);
    }
};

init();
