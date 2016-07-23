const {each, dom} = require('../util');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const sidebar = require('./sidebar');
const base = require('./base');
const view = require('./view');


const settings = Object.assign({
    modeToggle: false
}, allsettings.view);
const settingsTpl =
        '<div id="viewmode-settings" class="block"><h1 class="l10n-view">View</h1></div>';
const modeTpl =
        `<div id="viewmode-[MODE]" class="button mode">
            <img src="${resource.image('view-[MODE]')}" alt="viewmode-[MODE]"/>
        </div>`;
const sizeTpl =
        '<input id="viewmode-size" type="range" min="0" max="0" value="0">';
const toggleTpl =
        `<div id="viewmode-toggle" class="tool">
            <img alt="viewmode"/>
        </div>`;
let modes;
let sizes;


const onChanged = (mode, size) => {
    dom('#viewmode-settings .mode').rmCls('active');
    dom('#viewmode-' + mode).addCls('active');
    dom('#viewmode-size').val(sizes.indexOf(size));

    if (settings.modeToggle === 'next') {
        mode = modes[(modes.indexOf(mode) + 1) % modes.length];
    }
    dom('#viewmode-toggle img').attr('src', resource.image('view-' + mode));
};

const addSettings = () => {
    if (modes.length < 2 && sizes.length < 2) {
        return;
    }

    const $viewBlock = dom(settingsTpl);

    if (modes.length > 1) {
        each(modes, mode => {
            dom(modeTpl.replace(/\[MODE\]/g, mode))
                .on('click', () => {
                    view.setMode(mode);
                })
                .appTo($viewBlock);
        });
    }

    if (sizes.length > 1) {
        const max = sizes.length - 1;
        dom(sizeTpl)
            .attr('max', max)
            .on('input', ev => view.setSize(sizes[ev.target.valueAsNumber]))
            .on('change', ev => view.setSize(sizes[ev.target.valueAsNumber]))
            .appTo($viewBlock);
    }

    $viewBlock.appTo(sidebar.$el);
};

const onToggle = () => {
    const mode = view.getMode();
    const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
    const nextMode = modes[nextIdx];

    view.setMode(nextMode);
};

const addToggle = () => {
    if (settings.modeToggle && modes.length > 1) {
        dom(toggleTpl)
            .on('click', onToggle)
            .appTo(base.$toolbar);
    }
};

const init = () => {
    modes = view.getModes();
    sizes = view.getSizes();

    addSettings();
    addToggle();
    onChanged(view.getMode(), view.getSize());

    event.sub('view.mode.changed', onChanged);
};


init();
