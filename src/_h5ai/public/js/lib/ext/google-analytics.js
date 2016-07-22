const {map} = require('../util');
const event = require('../core/event');
const allsettings = require('../core/settings');

const win = global.window;
const settings = Object.assign({
    enabled: false,
    id: 'UA-000000-0'
}, allsettings['google-analytics-ua']);

const snippet = () => {
    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    /* eslint-enable */
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    snippet();

    win.ga('create', settings.id, 'auto');

    event.sub('location.changed', item => {
        const loc = win.location;
        win.ga('send', 'pageview', {
            location: loc.protocol + '//' + loc.host + item.absHref,
            title: map(item.getCrumb(), i => i.label).join(' > ')
        });
    });
};

init();
