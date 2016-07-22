const {each, isFn, isNum, dom, includes, compact} = require('../../util');
const event = require('../../core/event');
const resource = require('../../core/resource');
const allsettings = require('../../core/settings');
const store = require('../../core/store');

const win = global.window;
const settings = Object.assign({
    enabled: true
}, allsettings.preview);
const tplOverlay =
        `<div id="pv-overlay">
            <div id="pv-container"></div>
            <div id="pv-spinner"><img class="back"/><img class="spinner" src="${resource.image('spinner')}"/></div>
            <div id="pv-prev-area" class="hof"><img src="${resource.image('preview-prev')}"/></div>
            <div id="pv-next-area" class="hof"><img src="${resource.image('preview-next')}"/></div>
            <div id="pv-bottombar" class="clearfix hof">
                <ul id="pv-buttons">
                    <li id="pv-bar-close" class="bar-right bar-button"><img src="${resource.image('preview-close')}"/></li>
                    <li id="pv-bar-raw" class="bar-right"><a class="bar-button" target="_blank"><img src="${resource.image('preview-raw')}"/></a></li>
                    <li id="pv-bar-fullscreen" class="bar-right bar-button"><img src="${resource.image('preview-fullscreen')}"/></li>
                    <li id="pv-bar-next" class="bar-right bar-button"><img src="${resource.image('preview-next')}"/></li>
                    <li id="pv-bar-idx" class="bar-right bar-label"></li>
                    <li id="pv-bar-prev" class="bar-right bar-button"><img src="${resource.image('preview-prev')}"/></li>
                </ul>
            </div>
        </div>`;
const storekey = 'ext/preview';
let isFullscreen = store.get(storekey) || false;
let userAliveTimeoutId = null;
let onIndexChange = null;
let onAdjustSize = null;
let spinnerVisible = false;
let spinnerTimeoutId;

const adjustSize = () => {
    const docEl = win.document.documentElement;
    const winWidth = docEl.clientWidth;
    const winHeight = docEl.clientHeight;
    const margin = isFullscreen ? 0 : 20;
    const barHeight = isFullscreen ? 0 : 48;

    dom('#pv-container').css({
        width: winWidth - 2 * margin + 'px',
        height: winHeight - 2 * margin - barHeight + 'px',
        left: margin + 'px',
        top: margin + 'px'
    });

    dom('#pv-spinner').css({
        left: winWidth * 0.5 + 'px',
        top: winHeight * 0.5 + 'px'
    });

    if (isFullscreen) {
        dom('#pv-overlay').addCls('fullscreen');
        dom('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview-no-fullscreen'));
    } else {
        dom('#pv-overlay').rmCls('fullscreen');
        dom('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview-fullscreen'));
    }

    if (isFn(onAdjustSize)) {
        onAdjustSize();
    }
};

const setLabels = labels => {
    dom('#pv-buttons .bar-left').rm();
    each(labels, label => {
        dom('<li></li>')
            .addCls('bar-left')
            .addCls('bar-label')
            .text(label)
            .appTo('#pv-buttons');
    });
};

const onNext = () => {
    if (isFn(onIndexChange)) {
        onIndexChange(1);
    }
};

const onPrevious = () => {
    if (isFn(onIndexChange)) {
        onIndexChange(-1);
    }
};

const userAlive = () => {
    const $hof = dom('#pv-overlay .hof');
    win.clearTimeout(userAliveTimeoutId);
    $hof.show();
    if (isFullscreen) {
        userAliveTimeoutId = win.setTimeout(() => $hof.hide(), 2000);
    }
};

const onFullscreen = () => {
    isFullscreen = !isFullscreen;
    store.put(storekey, isFullscreen);

    userAlive();
    adjustSize();
};

const dropEvent = ev => {
    ev.stopPropagation();
    ev.preventDefault();
};

const onKeydown = ev => {
    const key = ev.keyCode;

    if (key === 27) { // esc
        dropEvent(ev);
        onExit(); // eslint-disable-line no-use-before-define
    } else if (key === 8 || key === 37) { // backspace, left
        dropEvent(ev);
        onPrevious();
    } else if (key === 13 || key === 32 || key === 39) { // enter, space, right
        dropEvent(ev);
        onNext();
    } else if (key === 70) { // f
        dropEvent(ev);
        onFullscreen();
    }
};

const onEnter = () => {
    setLabels([]);
    dom('#pv-container').clr();
    dom('#pv-overlay').show();
    dom(win).on('keydown', onKeydown);
    adjustSize();
};

const onExit = () => {
    setLabels([]);
    dom('#pv-container').clr();
    dom('#pv-overlay').hide();
    dom(win).off('keydown', onKeydown);
};

const setIndex = (idx, total) => {
    if (isNum(idx)) {
        dom('#pv-bar-idx').text(String(idx) + (isNum(total) ? '/' + String(total) : '')).show();
    } else {
        dom('#pv-bar-idx').text('').hide();
    }
};

const setRawLink = href => {
    if (href) {
        dom('#pv-bar-raw').show().find('a').attr('href', href);
    } else {
        dom('#pv-bar-raw').hide().find('a').attr('href', '#');
    }
};

const setOnIndexChange = fn => {
    onIndexChange = fn;
};

const setOnAdjustSize = fn => {
    onAdjustSize = fn;
};

const showSpinner = (show, src, delay) => {
    win.clearTimeout(spinnerTimeoutId);
    const $spinner = dom('#pv-spinner');

    if (!show) {
        spinnerVisible = false;
        $spinner.hide();
        return;
    }

    if (!spinnerVisible && delay) {
        spinnerTimeoutId = win.setTimeout(() => showSpinner(true, src), delay);
        return;
    }

    const $back = $spinner.find('.back');
    if (src) {
        $back.attr('src', src).show();
    } else {
        $back.hide();
    }
    spinnerVisible = true;
    $spinner.show();
};

const centerContent = () => {
    const $container = dom('#pv-container');

    const container = $container[0];
    const content = $container.children()[0];
    if (!container || !content) {
        return;
    }

    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;

    dom(content).css({
        left: (containerW - contentW) * 0.5 + 'px',
        top: (containerH - contentH) * 0.5 + 'px'
    });
};

const state = (items, idx, load, adjust) => {
    const inst = Object.assign(Object.create(state.prototype), {items, load, adjust});
    inst.setIdx(idx);

    setOnAdjustSize(adjust);
    setOnIndexChange(delta => inst.moveIdx(delta));
    onEnter();

    return {
        get item() {
            return inst.item;
        }
    };
};

state.prototype = {
    setIdx(idx) {
        this.idx = (idx + this.items.length) % this.items.length;
        this.item = this.items[this.idx];
        this.updateGui();
        this.updateContent();
    },

    moveIdx(delta) {
        this.setIdx(this.idx + delta);
    },

    updateGui() {
        setLabels([this.item.label]);
        setIndex(this.idx + 1, this.items.length);
        setRawLink(this.item.absHref);
    },

    updateContent() {
        const item = this.item;
        Promise.resolve()
            .then(() => {
                dom('#pv-container').hide().clr();
                showSpinner(true, item.thumbSquare || item.icon, 200);
            })
            .then(() => this.load(item))
            // delay for testing
            // .then(x => new Promise(resolve => setTimeout(() => resolve(x), 1000)))
            .then($content => {
                if (item !== this.item) {
                    return;
                }
                showSpinner(false);

                dom('#pv-container').clr().app($content).show();
                this.adjust();
            });
    }
};

const register = (types, enter) => {
    const initItem = item => {
        if (item.$view && includes(types, item.type)) {
            item.$view.find('a').on('click', ev => {
                ev.preventDefault();

                const matchedItems = compact(dom('#items .item').map(el => {
                    const matchedItem = el._item;
                    return includes(types, matchedItem.type) ? matchedItem : null;
                }));

                enter(matchedItems, matchedItems.indexOf(item));
            });
        }
    };

    event.sub('view.changed', added => each(added, initItem));
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    dom(tplOverlay)
        .hide()
        .appTo('body')
        .on('keydown', onKeydown)
        .on('mousemove', userAlive)
        .on('mousedown', userAlive)
        .on('click', ev => {
            if (ev.target.id === 'pv-overlay' || ev.target.id === 'pv-container') {
                onExit();
            }
        })
        .on('mousedown', dropEvent)
        .on('mousemove', dropEvent)
        .on('keydown', dropEvent)
        .on('keypress', dropEvent);

    dom('#pv-spinner').hide();
    dom('#pv-bar-prev, #pv-prev-area').on('click', onPrevious);
    dom('#pv-bar-next, #pv-next-area').on('click', onNext);
    dom('#pv-bar-close').on('click', onExit);
    dom('#pv-bar-fullscreen').on('click', onFullscreen);

    dom(win)
        .on('resize', adjustSize)
        .on('load', adjustSize);
};

init();

module.exports = {
    setLabels,
    centerContent,
    state,
    register
};
