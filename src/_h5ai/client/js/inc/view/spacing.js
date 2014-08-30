modulejs.define('view/spacing', ['_', '$', 'core/settings', 'core/event'], function (_, $, allsettings, event) {

    var settings = _.extend({
            maxWidth: 960,
            top: 50,
            right: 'auto',
            bottom: 50,
            left: 'auto'
        }, allsettings.spacing);


    function adjustSpacing() {

        $('#content').css({
            'margin-top': settings.top + $('#topbar').outerHeight(),
            'margin-bottom': settings.bottom + $('#bottombar').outerHeight()
        });
    }

    function init() {

        $('#content').css({
            'max-width': settings.maxWidth,
            'margin-right': settings.right,
            'margin-left': settings.left
        });

        event.sub('ready', adjustSpacing);
        $(window).on('resize', adjustSpacing);
    }


    init();
});
