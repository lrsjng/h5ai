const {jq, lo} = require('../globals');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const sidebar = require('./sidebar');
const topbar = require('./topbar');
const view = require('./view');


const settings = lo.extend({
    modeToggle: false
}, allsettings.view);
const tplSettings =
        '<div id="viewmode-settings" class="block"><h1 class="l10n-view">View</h1></div>';
const tplMode =
        `<div id="viewmode-[MODE]" class="button mode">
            <img src="${resource.image('view-[MODE]')}" alt="viewmode-[MODE]"/>
        </div>`;
const tplSize =
        '<input id="viewmode-size" type="range" min="0" max="0" value="0">';
const tplToggle =
        `<div id="viewmode-toggle" class="tool">
            <img alt="viewmode"/>
        </div>`;
let modes;
let sizes;


function onChanged(mode, size) {
    jq('#viewmode-settings .mode').removeClass('active');
    jq('#viewmode-' + mode).addClass('active');
    jq('#viewmode-size').val(lo.indexOf(sizes, size));

    if (settings.modeToggle === 'next') {
        mode = modes[(modes.indexOf(mode) + 1) % modes.length];
    }
    jq('#viewmode-toggle img').attr('src', resource.image('view-' + mode));
}

function addSettings() {
    if (modes.length < 2 && sizes.length < 2) {
        return;
    }

    const $viewBlock = jq(tplSettings);

    if (modes.length > 1) {
        lo.each(modes, mode => {
            jq(tplMode.replace(/\[MODE\]/g, mode))
                .on('click', () => {
                    view.setMode(mode);
                })
                .appendTo($viewBlock);
        });
    }

    if (sizes.length > 1) {
        const max = sizes.length - 1;
        jq(tplSize)
            .prop('max', max).attr('max', max)
            .on('input change', ev => {
                view.setSize(sizes[ev.target.valueAsNumber]);
            })
            .appendTo($viewBlock);
    }

    $viewBlock.appendTo(sidebar.$el);
}

function onToggle() {
    const mode = view.getMode();
    const nextIdx = (modes.indexOf(mode) + 1) % modes.length;
    const nextMode = modes[nextIdx];

    view.setMode(nextMode);
}

function addToggle() {
    if (settings.modeToggle && modes.length > 1) {
        jq(tplToggle)
            .on('click', onToggle)
            .appendTo(topbar.$toolbar);
    }
}

function init() {
    modes = view.getModes();
    sizes = view.getSizes();

    addSettings();
    addToggle();
    onChanged(view.getMode(), view.getSize());

    event.sub('view.mode.changed', onChanged);
}


init();
