const {each, dom} = require('../util');
const resource = require('../core/resource');
const allsettings = require('../core/settings');

const settings = Object.assign({
    enabled: false
}, allsettings.contextmenu);
const tplOverlay = '<div id="cm-overlay"></div>';
const tplPanel = '<div class="cm-panel"><ul></ul></div>';
const tplSep = '<li class="cm-sep"></li>';
const tplEntry = '<li class="cm-entry"><span class="cm-icon"><img/></span><span class="cm-text"></span></li>';
const tplLabel = '<li class="cm-label"><span class="cm-text"></span></li>';


const closestId = el => {
    while (!el._cmId && el.parentNode) {
        el = el.parentNode;
    }
    return el._cmId;
};

const createOverlay = callback => {
    const $overlay = dom(tplOverlay);

    const handle = ev => {
        ev.stopPropagation();
        ev.preventDefault();

        const cmId = closestId(ev.target);

        if (ev.target === $overlay[0] || cmId !== undefined) {
            $overlay.rm();
            callback(cmId);
        }
    };

    return $overlay
        .on('contextmenu', handle)
        .on('click', handle);
};

const createPanel = menu => {
    const $panel = dom(tplPanel);
    const $ul = $panel.find('ul');
    let $li;

    each(menu, entry => {
        if (entry.type === '-') {
            dom(tplSep).appTo($ul);
        } else if (entry.type === 'l') {
            dom(tplLabel).appTo($ul)
                .find('.cm-text').text(entry.text);
        } else if (entry.type === 'e') {
            $li = dom(tplEntry).appTo($ul);
            $li[0]._cmId = entry.id;
            $li.find('.cm-text').text(entry.text);
            if (entry.icon) {
                $li.find('.cm-icon img').attr('src', resource.icon(entry.icon));
            } else {
                $li.find('.cm-icon').addCls('no-icon');
            }
        }
    });

    return $panel;
};

const positionPanel = ($overlay, $panel, x, y) => {
    const margin = 4;

    $panel.css({
        left: 0,
        top: 0,
        opacity: 0
    });
    $overlay.show();

    const or = $overlay[0].getBoundingClientRect();
    const pr = $panel[0].getBoundingClientRect();

    const overlayLeft = or.left;
    const overlayTop = or.top;
    const overlayWidth = or.width;
    const overlayHeight = or.height;

    let panelWidth = pr.width;
    let panelHeight = pr.height;

    let posLeft = x;
    let posTop = y;

    if (panelWidth > overlayWidth - 2 * margin) {
        posLeft = margin;
        panelWidth = overlayWidth - 2 * margin;
    }

    if (panelHeight > overlayHeight - 2 * margin) {
        posTop = margin;
        panelHeight = overlayHeight - 2 * margin;
    }

    if (posLeft < overlayLeft + margin) {
        posLeft = overlayLeft + margin;
    }

    if (posLeft + panelWidth > overlayLeft + overlayWidth - margin) {
        posLeft = overlayLeft + overlayWidth - margin - panelWidth;
    }

    if (posTop < overlayTop + margin) {
        posTop = overlayTop + margin;
    }

    if (posTop + panelHeight > overlayTop + overlayHeight - margin) {
        posTop = overlayTop + overlayHeight - margin - panelHeight;
    }

    $panel.css({
        left: posLeft + 'px',
        top: posTop + 'px',
        width: panelWidth + 'px',
        height: panelHeight + 'px',
        opacity: 1
    });
};

const showMenuAt = (x, y, menu, callback) => {
    const $overlay = createOverlay(callback);
    const $panel = createPanel(menu);
    $overlay.hide().app($panel).appTo('body');
    positionPanel($overlay, $panel, x, y);
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    const menu = [
        {type: 'e', id: 'e1', text: 'testing context menus'},
        {type: 'e', id: 'e2', text: 'another entry'},
        {type: 'e', id: 'e3', text: 'one with icon', icon: 'folder'},
        {type: '-'},
        {type: 'e', id: 'e4', text: 'one with icon', icon: 'x'},
        {type: 'e', id: 'e5', text: 'one with icon', icon: 'img'}
    ];


    dom('#view').on('contextmenu', ev => {
        ev.preventDefault();
        // showMenuAt(ev.pageX, ev.pageY, menu, res => console.log('>> CB-RESULT >> ' + res));
        showMenuAt(ev.pageX, ev.pageY, menu);
    });
};


init();
