modulejs.define('ext/autorefresh', ['_', '$', 'core/settings', 'core/event', 'core/location'], function (_, $, allsettings, event, location) {

    var settings = _.extend({
            enabled: false,
            interval: 5000
        }, allsettings.autorefresh);
    var timeoutId = null;


    function heartbeat() {

        location.refresh();
    }

    function before() {

        clearTimeout(timeoutId);
    }

    function after() {

        clearTimeout(timeoutId);
        timeoutId = setTimeout(heartbeat, settings.interval);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        settings.interval = Math.max(1000, settings.interval);

        event.sub('location.beforeChange', before);
        event.sub('location.beforeRefresh', before);
        event.sub('location.changed', after);
        event.sub('location.refreshed', after);
    }


    init();
});
