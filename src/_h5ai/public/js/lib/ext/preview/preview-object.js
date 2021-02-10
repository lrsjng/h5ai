const {dom} = require('../../util');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    types: []
}, allsettings['preview-object']);
const tpl = '<div id="pv-content-object"></div>';

const updateGui = () => {
    const el = dom('#pv-content-object')[0];
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

const load = item => {
    console.log("loading");
    const $el = dom("<object><p>Your browser does not support in-frame PDF rendering. :/</p></object>")
        .attr("data", item.absHref)
        .attr("type", "application/pdf");
    return dom(tpl).app($el);
};

const init = () => {
    if (settings.enabled) {
        console.log("registered");
        preview.register(settings.types, load, updateGui);
    }
};

init();
