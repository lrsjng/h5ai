const {dom, onLoad} = require('../util');
const {win} = require('../globals');
const event = require('../core/event');
const allsettings = require('../core/settings');


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
    let piwikTracker = null;

    dom('<script></script>').attr('src', pkBaseURL + 'piwik.js').appTo('body');
    onLoad(() => {
        piwikTracker = win.Piwik.getTracker(pkBaseURL + 'piwik.php', settings.idSite);
        piwikTracker.enableLinkTracking();
    });

    event.sub('location.changed', item => {
        const title = item.getCrumb().map(i => i.label).join(' > ');
        piwikTracker.trackPageView(title);
    });
};


init();
