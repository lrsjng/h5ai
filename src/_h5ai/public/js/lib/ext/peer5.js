const {window: win, jQuery: jq, _: lo} = require('../win');
const allsettings = require('../core/settings');

const settings = lo.extend({
    enabled: false,
    id: 'z142i5n5qypq4cxr'
}, allsettings.peer5);


function init() {
    if (!settings.enabled) {
        return;
    }

    const peer5js = '//api.peer5.com/peer5.js?id=' + settings.id;

    jq.ajax({
        url: peer5js,
        dataType: 'script',
        cache: true
    });

    // attach to file items, once the DOM is ready
    jq(() => {
        jq('body').on('click', '.item.file > a', ev => { // eslint-disable-line consistent-return
            if (win.peer5) {
                ev.preventDefault();
                const url = ev.currentTarget.href;
                win.peer5.download(url);
                return false;
            }
        });
    });
}


init();
