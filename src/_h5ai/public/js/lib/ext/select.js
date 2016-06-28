const {each, dom} = require('../util');
const {win} = require('../globals');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');


const doc = win.document;
const settings = Object.assign({
    enabled: false,
    clickndrag: false,
    checkboxes: false
}, allsettings.select);
const selectorTpl =
        `<span class="selector">
            <img src="${resource.image('selected')}" alt="selected"/>
        </span>`;
const $document = dom(doc);
const $html = dom('html');
const $selectionRect = dom('<div id="selection-rect"></div>');

let dragStartX = 0;
let dragStartY = 0;
let isDragSelect = false;
let isCtrlPressed = false;


const publish = () => {
    const items = dom('#items .item.selected').map(el => el._item);
    event.pub('selection', items);
};

const elementRect = $el => {
    if ($el.isHidden()) {
        return null;
    }

    const rect = $el[0].getBoundingClientRect();
    // const rect = {left: 0, top: 0, right: 10, bottom: 10};
    return {
        l: rect.left,
        t: rect.top,
        r: rect.right,
        b: rect.bottom
    };
};

const doOverlap = (rect1, rect2) => {
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
};

const selectionUpdate = ev => {
    const left = Math.min(dragStartX, ev.pageX);
    const top = Math.min(dragStartY, ev.pageY);
    const width = Math.abs(dragStartX - ev.pageX);
    const height = Math.abs(dragStartY - ev.pageY);

    if (!isDragSelect && width < 4 && height < 4) {
        return;
    }

    if (!isDragSelect && !isCtrlPressed) {
        dom('#items .item').rmCls('selected');
        publish();
    }

    isDragSelect = true;
    $html.addCls('drag-select');

    $selectionRect.show();
    const style = $selectionRect[0].style;
    style.left = left + 'px';
    style.top = top + 'px';
    style.width = width + 'px';
    style.height = height + 'px';

    const selRect = elementRect($selectionRect);
    dom('#items .item').rmCls('selecting').each(el => {
        const $item = dom(el);
        const inter = doOverlap(selRect, elementRect($item.find('a')));

        if (inter && !$item.hasCls('folder-parent')) {
            $item.addCls('selecting');
        }
    });

    ev.preventDefault();
};

const selectionEnd = ev => {
    $document
        .off('mousemove', selectionUpdate)
        .off('mouseup', selectionEnd);

    if (!isDragSelect) {
        return;
    }

    dom('#items .item.selecting.selected').rmCls('selecting').rmCls('selected');
    dom('#items .item.selecting').rmCls('selecting').addCls('selected');
    publish();

    $html.rmCls('drag-select');
    $selectionRect.hide();

    ev.preventDefault();
};

const selectionStart = ev => {
    // only start on left button, don't block scrollbar
    if (ev.button !== 0 || ev.offsetX >= dom('#content')[0].offsetWidth - 14) {
        return;
    }

    isDragSelect = false;
    isCtrlPressed = ev.ctrlKey || ev.metaKey;
    dragStartX = ev.pageX;
    dragStartY = ev.pageY;

    $document
        .on('mousemove', selectionUpdate)
        .on('mouseup', selectionEnd);

    ev.preventDefault();
};

const closestItem = el => {
    while (!el._item && el.parentNode) {
        el = el.parentNode;
    }
    return el._item;
};

const onSelectorClick = ev => {
    closestItem(ev.target).$view.tglCls('selected');
    publish();
    ev.preventDefault();
    ev.stopPropagation();
};

const addCheckbox = item => {
    if (item.$view && !item.isCurrentParentFolder()) {
        dom(selectorTpl)
            .on('click', onSelectorClick)
            .appTo(item.$view.find('a'));
    }
};

const onViewChanged = (added, removed) => {
    if (settings.checkboxes) {
        each(added, addCheckbox);
    }

    each(removed, item => {
        if (item.$view) {
            item.$view.rmCls('selected');
        }
    });

    publish();
};

const init = () => {
    if (!settings.enabled || !settings.clickndrag && !settings.checkboxes) {
        return;
    }

    event.sub('view.changed', onViewChanged);

    if (settings.clickndrag) {
        $selectionRect.hide().appTo('body');

        dom('#content')
            .on('mousedown', selectionStart)
            .on('drag', ev => ev.preventDefault())
            .on('dragstart', ev => ev.preventDefault())
            .on('click', () => {
                dom('#items .item').rmCls('selected');
                publish();
            });
    }
};


init();
