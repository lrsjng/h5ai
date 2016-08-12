const {dom, awaitLoad} = require('../util');
const event = require('../core/event');
const allsettings = require('../core/settings');

const win = global.window;
const settings = Object.assign({
    enabled: false,
    baseURL: 'not-set',
    idSite: 0
}, allsettings['piwik-analytics']);

const init = () => {
    if (!settings.enabled) {
        return;
    }

    // reference: http://piwik.org/docs/javascript-tracking/

    const pkBaseURL = (win.location.protocol === 'https:' ? 'https://' : 'http://') + settings.baseURL + '/';
    const queue = [];
    let piwikTracker = null;

    dom('<script></script>').attr('src', pkBaseURL + 'piwik.js').appTo('body');
    awaitLoad().then(() => {
        piwikTracker = win.Piwik && win.Piwik.getTracker(pkBaseURL + 'piwik.php', settings.idSite);
        if (piwikTracker) {
            piwikTracker.enableLinkTracking();
            while (queue.length) {
                piwikTracker.trackPageView(queue.shift());
            }
        }
    });

    event.sub('location.changed', item => {
        const title = item.getCrumb().map(i => i.label).join(' > ');
        if (piwikTracker) {
            piwikTracker.trackPageView(title);
        } else {
            queue.push(title);
        }
    });
};


init();
