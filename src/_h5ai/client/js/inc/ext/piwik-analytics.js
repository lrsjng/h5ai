modulejs.define('ext/piwik-analytics', ['_', '$', 'core/settings'], function (_, $, allsettings) {

    var settings = _.extend({
            enabled: false,
            baseURL: 'not-set',
            idSite: 0
        }, allsettings['piwik-analytics']);


    function init() {

        if (!settings.enabled) {
            return;
        }

        // reference: http://piwik.org/docs/javascript-tracking/

        var pkBaseURL = ((document.location.protocol === 'https:') ? 'https://' : 'http://') + settings.baseURL + '/';

        $('<script/>').attr('src', pkBaseURL + 'piwik.js').appendTo('body');
        $(window).load(function () {
            /*global Piwik */

            var piwikTracker = Piwik.getTracker(pkBaseURL + 'piwik.php', settings.idSite);
            piwikTracker.trackPageView();
            piwikTracker.enableLinkTracking();
        });
    }


    init();
});
