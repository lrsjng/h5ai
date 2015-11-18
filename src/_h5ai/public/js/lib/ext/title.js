modulejs.define('ext/title', ['_', 'core/event', 'core/settings'], function (_, event, allsettings) {
    var settings = _.extend({
        enabled: false
    }, allsettings.title);

    function onLocationChanged(item) {
        var labels = _.pluck(item.getCrumb(), 'label');
        var title = labels.join(' > ');

        if (labels.length > 1) {
            title = labels[labels.length - 1] + ' - ' + title;
        }

        document.title = title;
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        event.sub('location.changed', onLocationChanged);
    }

    init();
});
