const {win, jq, lo} = require('../globals');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');


const settings = lo.extend({
    enabled: true
}, allsettings.preview);
const $window = jq(win);
const tplOverlay =
        `<div id="pv-overlay">
            <div id="pv-content"/>
            <div id="pv-spinner"><img class="back"/><img class="spinner" src="${resource.image('spinner')}"/></div>
            <div id="pv-prev-area" class="hof"><img src="${resource.image('preview-prev')}"/></div>
            <div id="pv-next-area" class="hof"><img src="${resource.image('preview-next')}"/></div>
            <div id="pv-bottombar" class="clearfix hof">
                <ul id="pv-buttons">
                    <li id="pv-bar-close" class="bar-right bar-button"><img src="${resource.image('preview-close')}"/></li>
                    <li id="pv-bar-raw" class="bar-right"><a class="bar-button" target="_blank"><img src="${resource.image('preview-raw')}"/></a></li>
                    <li id="pv-bar-fullscreen" class="bar-right bar-button"><img src="${resource.image('preview-fullscreen')}"/></li>
                    <li id="pv-bar-next" class="bar-right bar-button"><img src="${resource.image('preview-next')}"/></li>
                    <li id="pv-bar-idx" class="bar-right bar-label"/>
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


function adjustSize() {
    const winWidth = $window.width();
    const winHeight = $window.height();
    const $container = jq('#pv-content');
    const $spinner = jq('#pv-spinner');
    const margin = isFullscreen ? 0 : 20;
    const barHeight = isFullscreen ? 0 : 48;

    $container.css({
        width: winWidth - 2 * margin,
        height: winHeight - 2 * margin - barHeight,
        left: margin,
        top: margin
    });

    $spinner.css({
        left: winWidth * 0.5,
        top: winHeight * 0.5
    });

    if (isFullscreen) {
        jq('#pv-overlay').addClass('fullscreen');
        jq('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview-no-fullscreen'));
    } else {
        jq('#pv-overlay').removeClass('fullscreen');
        jq('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview-fullscreen'));
    }

    if (lo.isFunction(onAdjustSize)) {
        onAdjustSize(1);
    }
}

function setLabels(labels) {
    jq('#pv-buttons .bar-left').remove();
    lo.each(labels, label => {
        jq('<li/>')
            .addClass('bar-left bar-label')
            .text(label)
            .appendTo('#pv-buttons');
    });
}

function onNext() {
    if (lo.isFunction(onIndexChange)) {
        onIndexChange(1);
    }
}

function onPrevious() {
    if (lo.isFunction(onIndexChange)) {
        onIndexChange(-1);
    }
}

function userAlive() {
    win.clearTimeout(userAliveTimeoutId);
    jq('#pv-overlay .hof').stop(true, true).fadeIn(200);

    if (isFullscreen) {
        userAliveTimeoutId = win.setTimeout(() => {
            jq('#pv-overlay .hof').stop(true, true).fadeOut(2000);
        }, 2000);
    }
}

function onFullscreen() {
    isFullscreen = !isFullscreen;
    store.put(storekey, isFullscreen);

    userAlive();
    adjustSize();
}

function onKeydown(ev) {
    const key = ev.which;

    if (key === 27) { // esc
        ev.preventDefault();
        ev.stopImmediatePropagation();
        onExit(); // eslint-disable-line no-use-before-define
    } else if (key === 8 || key === 37) { // backspace, left
        ev.preventDefault();
        ev.stopImmediatePropagation();
        onPrevious();
    } else if (key === 13 || key === 32 || key === 39) { // enter, space, right
        ev.preventDefault();
        ev.stopImmediatePropagation();
        onNext();
    } else if (key === 70) { // f
        ev.preventDefault();
        ev.stopImmediatePropagation();
        onFullscreen();
    }
}

function onEnter() {
    setLabels([]);
    jq('#pv-content').empty();
    jq('#pv-overlay').stop(true, true).fadeIn(200);
    $window.on('keydown', onKeydown);
    adjustSize();
}

function onExit() {
    $window.off('keydown', onKeydown);
    jq('#pv-overlay').stop(true, true).fadeOut(200, () => {
        jq('#pv-content').empty();
        setLabels([]);
    });
}

function setIndex(idx, total) {
    if (lo.isNumber(idx)) {
        jq('#pv-bar-idx').text(String(idx) + (lo.isNumber(total) ? '/' + String(total) : '')).show();
    } else {
        jq('#pv-bar-idx').text('').hide();
    }
}

function setRawLink(href) {
    if (href) {
        jq('#pv-bar-raw').show().find('a').attr('href', href);
    } else {
        jq('#pv-bar-raw').hide().find('a').attr('href', '#');
    }
}

function setOnIndexChange(fn) {
    onIndexChange = fn;
}

function setOnAdjustSize(fn) {
    onAdjustSize = fn;
}

function showSpinner(show, src, millis) {
    if (!lo.isNumber(millis)) {
        millis = 300;
    }

    const $spinner = jq('#pv-spinner').stop(true, true);
    const $back = $spinner.find('.back');

    if (show) {
        if (src) {
            $back.attr('src', src).show();
        } else {
            $back.hide();
        }
        spinnerVisible = true;
        $spinner.fadeIn(millis);
    } else {
        spinnerVisible = false;
        $spinner.fadeOut(millis);
    }
}

function isSpinnerVisible() {
    return spinnerVisible;
}

function init() {
    if (!settings.enabled) {
        return;
    }

    jq(tplOverlay).appendTo('body');

    jq('#pv-spinner').hide();
    jq('#pv-bar-prev, #pv-prev-area').on('click', onPrevious);
    jq('#pv-bar-next, #pv-next-area').on('click', onNext);
    jq('#pv-bar-close').on('click', onExit);
    jq('#pv-bar-fullscreen').on('click', onFullscreen);

    jq('#pv-overlay')
        .on('keydown', onKeydown)
        .on('mousemove mousedown', userAlive)
        .on('click mousedown mousemove keydown keypress', ev => {
            if (ev.type === 'click' && (ev.target.id === 'pv-overlay' || ev.target.id === 'pv-content')) {
                onExit();
            }
            ev.stopImmediatePropagation();
        });

    $window.on('resize load', adjustSize);
}


init();

module.exports = {
    enter: onEnter,
    exit: onExit,
    setIndex,
    setRawLink,
    setLabels,
    setOnIndexChange,
    setOnAdjustSize,
    showSpinner,
    isSpinnerVisible
};
