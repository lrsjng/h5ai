const {each} = require('../util');
const {win, jq} = require('../globals');
const resource = require('../core/resource');
const allsettings = require('../core/settings');

const doc = win.document;
const settings = Object.assign({
    enabled: false
}, allsettings.contextmenu);
const templateOverlay = '<div id="cm-overlay"/>';
const templatePanel = '<div class="cm-panel"><ul/></div>';
const templateSep = '<li class="cm-sep"/>';
const templateEntry = '<li class="cm-entry"><span class="cm-icon"><img/></span><span class="cm-text"/></li>';
const templateLabel = '<li class="cm-label"><span class="cm-text"/></li>';


function createOverlay(callback) {
    const $overlay = jq(templateOverlay);

    $overlay
        .on('click contextmenu', ev => {
            ev.stopPropagation();
            ev.preventDefault();

            const cmId = jq(ev.target).closest('.cm-entry').data('cm-id');

            if (ev.target === $overlay[0] || cmId !== undefined) {
                $overlay.remove();
                callback(cmId);
            }
        });

    return $overlay;
}

function createPanel(menu) {
    const $panel = jq(templatePanel);
    const $ul = $panel.find('ul');
    let $li;

    each(menu, entry => {
        if (entry.type === '-') {
            jq(templateSep).appendTo($ul);
        } else if (entry.type === 'l') {
            jq(templateLabel).appendTo($ul)
                .find('.cm-text').text(entry.text);
        } else if (entry.type === 'e') {
            $li = jq(templateEntry).appendTo($ul);
            $li.data('cm-id', entry.id);
            $li.find('.cm-text').text(entry.text);
            if (entry.icon) {
                $li.find('.cm-icon img').attr('src', resource.icon(entry.icon));
            } else {
                $li.find('.cm-icon').addClass('no-icon');
            }
        }
    });

    return $panel;
}

function positionPanel($overlay, $panel, x, y) {
    const margin = 4;

    $panel.css({
        left: 0,
        top: 0,
        opacity: 0
    });
    $overlay.show();

    const overlayOffset = $overlay.offset();
    const overlayLeft = overlayOffset.left;
    const overlayTop = overlayOffset.top;
    const overlayWidth = $overlay.outerWidth(true);
    const overlayHeight = $overlay.outerHeight(true);

    // const panelOffset = $panel.offset();
    // const panelLeft = panelOffset.left;
    // const panelTop = panelOffset.top;
    let panelWidth = $panel.outerWidth(true);
    let panelHeight = $panel.outerHeight(true);

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
        left: posLeft,
        top: posTop,
        width: panelWidth,
        height: panelHeight,
        opacity: 1
    });
}

function showMenuAt(x, y, menu, callback) {
    const $overlay = createOverlay(callback);
    const $panel = createPanel(menu);
    $overlay.append($panel).appendTo('body');
    positionPanel($overlay, $panel, x, y);
}

function init() {
    if (!settings.enabled) {
        return;
    }

    jq(doc).on('contextmenu', ev => {
        ev.stopPropagation();
        ev.preventDefault();
        jq(ev.target).trigger(jq.Event('h5ai-contextmenu', {
            originalEvent: ev,
            showMenu: (menu, callback) => {
                showMenuAt(ev.pageX, ev.pageY, menu, callback);
            }
        }));
    });

    // const menu = [
    //     {type: 'e', id: 'e1', text: 'testing context menus'},
    //     {type: 'e', id: 'e2', text: 'another entry'},
    //     {type: 'e', id: 'e3', text: 'one with icon', icon: 'folder'},
    //     {type: '-'},
    //     {type: 'e', id: 'e4', text: 'one with icon', icon: 'x'},
    //     {type: 'e', id: 'e5', text: 'one with icon', icon: 'img'}
    // ];
    // const callback = res => {
    //     console.log('>> CB-RESULT >> ' + res);
    // };
    //
    // jq(doc).on('h5ai-contextmenu', '#items .item.folder', ev => {
    //     console.log('CM', ev);
    //     ev.showMenu(menu, callback);
    // });
}


init();
