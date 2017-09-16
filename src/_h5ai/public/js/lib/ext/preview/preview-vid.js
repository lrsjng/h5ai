const {dom, isFn} = require('../../util');
const allsettings = require('../../core/settings');
const preview = require('./preview');

const settings = Object.assign({
    enabled: false,
    autoplay: true,
    types: []
}, allsettings['preview-vid']);
const tpl = '<video id="pv-content-vid"/>';

const updateGui = () => {
    const el = dom('#pv-content-vid')[0];
    if (!el) {
        return;
    }

    const elW = el.offsetWidth;
    const elVW = el.videoWidth;
    const elVH = el.videoHeight;

    preview.setLabels([
        preview.item.label,
        String(elVW) + 'x' + String(elVH),
        String((100 * elW / elVW).toFixed(0)) + '%'
    ]);
};

const addUnloadFn = el => {
    el.unload = () => {
        el.src = '';
        el.load();
    };
};

const load = item => {
    return new Promise(resolve => {
        const $el = dom(tpl)
            .on('loadedmetadata', () => resolve($el))
            .on('click', () => togglePlay($el[0]))
            .attr('controls', 'controls');
        if (settings.autoplay) {
            $el.attr('autoplay', 'autoplay');
        }
        addUnloadFn($el[0]);
        $el.attr('src', item.absHref);
    });
};

const togglePlay = el => {
    if (el.paused) {
        el.play();
    } else {
        el.pause();
    }
};

const movieDelta = 5;
const volumeDelta = 0.07;
const keypress = key => {
    const el = dom('#pv-content-vid')[0];
    if (!el) {
        return false;
    }

    let handled = true;
    switch(key) {
        case 37: // left
            el.currentTime -= movieDelta;
            break;

        case 39: // right
            el.currentTime += movieDelta;
            break;

        case 38: // up
            el.volume += volumeDelta;
            break;

        case 40: // down
            el.volume -= volumeDelta;
            break;

        case 32: // space
            togglePlay(el);
            break;

        case 77: // 'm' -- mute
            el.muted = !el.muted;
            break;

        case 70:
        {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
                let exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
                if (isFn(exitFullscreen)) {
                    exitFullscreen.call(document);
                } else {
                    handled = false;
                }
            } else {
                let requestFullscreen = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
                if (isFn(requestFullscreen)) {
                    requestFullscreen.call(el);
                } else {
                    handled = false;
                }
            }
            break;
        }

        default:
            handled = false;
    }

    return handled;
}

const init = () => {
    if (settings.enabled) {
        preview.register(settings.types, load, updateGui, keypress);
    }
};

init();
