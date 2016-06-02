const {document: doc, jQuery: jq, _: lo} = require('../win');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');


const settings = lo.extend({
    enabled: false,
    clickndrag: false,
    checkboxes: false
}, allsettings.select);
const template = '<span class="selector"><img src="' + resource.image('selected') + '" alt="selected"/></span>';
let x = 0;
let y = 0;
let l = 0;
let t = 0;
let w = 0;
let h = 0;
let isDragSelect;
let isCtrlPressed;
const shrink = 1 / 3;
const $document = jq(doc);
const $html = jq('html');
const $selectionRect = jq('<div id="selection-rect"/>');


function publish() {
    const items = lo.map(jq('#items .item.selected'), itemElement => {
        return jq(itemElement).data('item');
    });
    event.pub('selection', items);
}

function elementRect($element) {
    if (!$element.is(':visible')) {
        return null;
    }

    const offset = $element.offset();
    const elL = offset.left;
    const elT = offset.top;
    const elW = $element.outerWidth();
    const elH = $element.outerHeight();
    return {l: elL, t: elT, w: elW, h: elH, r: elL + elW, b: elT + elH};
}

function doOverlap(rect1, rect2) {
    if (!rect1 || !rect2) {
        return false;
    }

    const left = Math.max(rect1.l, rect2.l);
    const right = Math.min(rect1.r, rect2.r);
    const top = Math.max(rect1.t, rect2.t);
    const bottom = Math.min(rect1.b, rect2.b);
    const width = right - left;
    const height = bottom - top;

    return width >= 0 && height >= 0;
}

function selectionUpdate(ev) {
    l = Math.min(x, ev.pageX);
    t = Math.min(y, ev.pageY);
    w = Math.abs(x - ev.pageX);
    h = Math.abs(y - ev.pageY);

    if (!isDragSelect && w < 4 && h < 4) {
        return;
    }

    if (!isDragSelect && !isCtrlPressed) {
        jq('#items .item').removeClass('selected');
        publish();
    }

    isDragSelect = true;
    $html.addClass('drag-select');

    ev.preventDefault();
    $selectionRect
        .stop(true, true)
        .css({left: l, top: t, width: w, height: h, opacity: 1})
        .show();

    const selRect = elementRect($selectionRect);
    jq('#items .item').removeClass('selecting').each((idx, el) => {
        const $item = jq(el);
        const inter = doOverlap(selRect, elementRect($item.find('a')));

        if (inter && !$item.hasClass('folder-parent')) {
            $item.addClass('selecting');
        }
    });
}

function selectionEnd(ev) {
    $document.off('mousemove', selectionUpdate);

    if (!isDragSelect) {
        return;
    }

    ev.preventDefault();
    jq('#items .item.selecting.selected').removeClass('selecting').removeClass('selected');
    jq('#items .item.selecting').removeClass('selecting').addClass('selected');
    publish();

    $html.removeClass('drag-select');
    $selectionRect
        .stop(true, true)
        .animate({
            left: l + w * 0.5 * shrink,
            top: t + h * 0.5 * shrink,
            width: w * (1 - shrink),
            height: h * (1 - shrink),
            opacity: 0
        },
        300,
        () => {
            $selectionRect.hide();
        });
}

function selectionStart(ev) {
    // only on left button and don't block scrollbar
    if (ev.button !== 0 || ev.offsetX >= jq('#content').width() - 14) {
        return;
    }

    isDragSelect = false;
    isCtrlPressed = ev.ctrlKey || ev.metaKey;
    x = ev.pageX;
    y = ev.pageY;

    $document
        .on('mousemove', selectionUpdate)
        .one('mouseup', selectionEnd);
}

function onSelectorClick(ev) {
    ev.stopImmediatePropagation();
    ev.preventDefault();

    jq(ev.target).closest('.item').toggleClass('selected');
    publish();
}

function addCheckbox(item) {
    if (item.$view && !item.isCurrentParentFolder()) {
        jq(template)
            .on('click', onSelectorClick)
            .appendTo(item.$view.find('a'));
    }
}

function onViewChanged(added, removed) {
    if (settings.checkboxes) {
        lo.each(added, addCheckbox);
    }

    lo.each(removed, item => {
        if (item.$view) {
            item.$view.removeClass('selected');
        }
    });

    publish();
}

function init() {
    if (!settings.enabled || !settings.clickndrag && !settings.checkboxes) {
        return;
    }

    event.sub('view.changed', onViewChanged);

    if (settings.clickndrag) {
        $selectionRect.hide().appendTo('body');

        jq('#content')
            .on('mousedown', selectionStart)
            .on('drag dragstart', ev => {
                ev.stopImmediatePropagation();
                ev.preventDefault();
            })
            .on('click', () => {
                jq('#items .item').removeClass('selected');
                publish();
            });
    }
}


init();
