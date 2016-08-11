const {each, dom} = require('../util');
const event = require('../core/event');
const resource = require('../core/resource');
const allsettings = require('../core/settings');

const doc = global.window.document;
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
const mmax = Math.max;
const mmin = Math.min;
const mabs = Math.abs;

let dragStartX = 0;
let dragStartY = 0;


const publish = () => {
    const items = dom('#items .item.selected').map(el => el._item);
    event.pub('selection', items);
};

const elRect = el => {
    const $el = dom(el);
    if (!$el.length || $el.isHidden()) {
        return null;
    }
    const rect = $el[0].getBoundingClientRect();
    return {l: rect.left, t: rect.top, r: rect.right, b: rect.bottom};
};

const rectsAreEqual = (r1, r2) => {
    return !!r1 && !!r2 &&
        r1.l === r2.l &&
        r1.t === r2.t &&
        r1.r === r2.r &&
        r1.b === r2.b;
};

const updateRects = $items => {
    const el0 = $items[0];
    if (!rectsAreEqual(elRect(el0), el0 && el0._rect)) {
        $items.each(el => {
            el._rect = elRect(el);
        });
    }
};

const rectsDoOverlap = (rect1, rect2) => {
    if (!rect1 || !rect2) {
        return false;
    }

    const maxLeft = mmax(rect1.l, rect2.l);
    const minRight = mmin(rect1.r, rect2.r);
    const maxTop = mmax(rect1.t, rect2.t);
    const minBottom = mmin(rect1.b, rect2.b);

    return maxLeft <= minRight && maxTop <= minBottom;
};

const getPointer = ev => {
    const content = dom('#content')[0];
    const r = elRect(content);
    const x = ev.pageX - r.l + content.scrollLeft;
    const y = ev.pageY - r.t + content.scrollTop;
    return {x, y};
};

const selectionUpdate = ev => {
    const {x, y} = getPointer(ev);
    const left = mmin(dragStartX, x);
    const top = mmin(dragStartY, y);
    const width = mabs(dragStartX - x);
    const height = mabs(dragStartY - y);
    const isCtrlPressed = ev.ctrlKey || ev.metaKey;

    if (!isCtrlPressed && width < 4 && height < 4) {
        return;
    }

    if (!isCtrlPressed) {
        dom('#items .item').rmCls('selected');
    }

    $html.addCls('drag-select');

    $selectionRect.show().css({
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
        height: height + 'px'
    });

    const selRect = elRect($selectionRect);
    const $items = dom('#items .item:not(.folder-parent)');
    updateRects($items);

    $items.rmCls('selecting').each(el => {
        if (rectsDoOverlap(selRect, el._rect)) {
            dom(el).addCls('selecting');
        }
    });
};

const selectionEnd = ev => {
    $document
        .off('mousemove', selectionUpdate)
        .off('mouseup', selectionEnd);

    selectionUpdate(ev);
    dom('#items .item.selecting.selected').rmCls('selecting').rmCls('selected');
    dom('#items .item.selecting').rmCls('selecting').addCls('selected');
    publish();

    $html.rmCls('drag-select');
    $selectionRect.hide();

    ev.stopPropagation();
    ev.preventDefault();
};

const selectionStart = ev => {
    // only start on left button, don't block scrollbar
    if (ev.button !== 0 || ev.offsetX >= dom('#content')[0].offsetWidth - 16) {
        return;
    }

    const {x, y} = getPointer(ev);
    dragStartX = x;
    dragStartY = y;

    $document
        .on('mousemove', selectionUpdate)
        .on('mouseup', selectionEnd);

    selectionUpdate(ev);
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
    ev.stopPropagation();
    ev.preventDefault();
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
        $selectionRect.hide().appTo('#content');

        dom('#content')
            .on('mousedown', selectionStart)
            .on('drag', ev => ev.preventDefault())
            .on('dragstart', ev => ev.preventDefault());
    }
};


init();
