modulejs.define('ext/google-analytics-ua', ['_', 'core/event', 'core/settings'], function (_, event, allsettings) {
    var settings = _.extend({
        enabled: false,
        id: 'UA-000000-0'
    }, allsettings['google-analytics-ua']);

    function snippet() {
        /* eslint-disable */
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        /* eslint-enable */
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        snippet();

        var WIN = window;
        var GA = 'ga';
        WIN[GA]('create', settings.id, 'auto');

        event.sub('location.changed', function (item) {
            var loc = WIN.location;
            WIN[GA]('send', 'pageview', {
                location: loc.protocol + '//' + loc.host + item.absHref,
                title: _.pluck(item.getCrumb(), 'label').join(' > ')
            });
        });
    }

    init();
});
