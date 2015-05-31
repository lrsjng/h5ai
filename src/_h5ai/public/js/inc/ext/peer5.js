modulejs.define('ext/peer5', ['_', '$', 'core/event', 'core/resource', 'core/settings'], function (_, $, event, resource, allsettings) {

    var settings = _.extend({
            enabled: false,
            id: 'z142i5n5qypq4cxr'
        }, allsettings.peer5);

    // Add icon and html for load peer5 download
    var template = '<span class="peer5Download"><img src="' + resource.image('peer5-download') + '" alt="peer5Download"/></span>';

    function peer5Download(items) {
        _.each(items, function (item) {
            var url =  item.absHref;
            if (item.$view && !item.isFolder()) {
                $(template)
                    .on('click', function (ev) {

                        if (window.peer5) {
                            ev.preventDefault();
                            window.peer5.download(url);
                            return false;
                        }
                    })
                    .appendTo(item.$view.find('a'));
                }
        });
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        var peer5js = '//api.peer5.com/peer5.js?id=' + settings.id;

        // load peer5 with caching
        $.ajax({
            url: peer5js,
            dataType: 'script',
            cache: true
        });

        event.sub('view.changed', peer5Download);

        // attach to file items, once the DOM is ready
        $(function () {

            // load peer5 download in preview mode
            $('#pv-bar-raw').on('click', '.bar-button', function (ev) {

                if (window.peer5) {
                    ev.preventDefault();
                    var url = ev.currentTarget.href;
                    window.peer5.download(url);
                    return false;
                }
            });
        });
    }


    init();
});
