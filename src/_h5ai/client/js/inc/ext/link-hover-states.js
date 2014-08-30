modulejs.define('ext/link-hover-states', ['_', '$', 'core/settings', 'core/event'], function (_, $, allsettings, event) {

    var settings = _.extend({
            enabled: false
        }, allsettings['link-hover-states']);
    var selector = "a[href^='/']";


    function selectLinks(href) {

        return $(_.filter($(selector), function (el) {

            return $(el).attr('href') === href;
        }));
    }

    function onMouseEnter() {

        var href = $(this).attr('href');

        selectLinks(href).addClass('hover');
    }

    function onMouseLeave() {

        var href = $(this).attr('href');

        selectLinks(href).removeClass('hover');
    }

    function onLocationChanged() {

        $('.hover').removeClass('hover');
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $('body')
            .on('mouseenter', selector, onMouseEnter)
            .on('mouseleave', selector, onMouseLeave);

        event.sub('location.changed', onLocationChanged);
    }


    init();
});
