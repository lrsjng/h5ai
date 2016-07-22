const {includes, compact, dom} = require('../../util');
const preview = require('./preview');

const initItemFn = (types, onEnter) => {
    return item => {
        if (item.$view && includes(types, item.type)) {
            item.$view.find('a').on('click', ev => {
                ev.preventDefault();

                const matchedItems = compact(dom('#items .item').map(el => {
                    const matchedItem = el._item;
                    return includes(types, matchedItem.type) ? matchedItem : null;
                }));

                onEnter(matchedItems, matchedItems.indexOf(item));
            });
        }
    };
};

const pvState = (items, idx = 0, load, adjust) => {
    const inst = Object.assign(Object.create(pvState.prototype), {items, load, adjust});
    preview.setOnAdjustSize(adjust);
    preview.setOnIndexChange(delta => inst.moveIdx(delta));
    preview.enter();
    inst.setIdx(idx);
    return inst;
};

pvState.prototype = {
    constructor: pvState,

    setIdx(idx) {
        this.idx = (idx + this.items.length) % this.items.length;
        this.item = this.items[this.idx];
        preview.setLabels([this.item.label]);
        preview.setIndex(this.idx + 1, this.items.length);
        preview.setRawLink(this.item.absHref);
        this.loadContent(this.item);
    },

    moveIdx(delta) {
        this.setIdx(this.idx + delta);
    },

    loadContent(item) {
        Promise.resolve()
            .then(() => {
                dom('#pv-content').hide().clr();
                preview.showSpinner(true, item.thumbSquare || item.icon, 200);
            })
            .then(() => this.load(item))
            .then($content => {
                if (item !== this.item) {
                    return;
                }
                preview.showSpinner(false);

                dom('#pv-content').clr().app($content).show();
                this.adjust();
            });
    }
};

module.exports = {
    initItemFn,
    pvState
};
