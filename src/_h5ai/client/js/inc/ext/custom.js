modulejs.define('ext/custom', ['_', '$', 'marked', 'core/settings', 'core/server', 'core/event', 'core/resource'], function (_, $, marked, allsettings, server, event, resource) {

    var settings = _.extend({
            enabled: false
        }, allsettings.custom);
    var $header, $footer;
    var duration = 200;


    function onLocationChanged(item) {

        server.request({action: 'get', custom: true, customHref: item.absHref}, function (response) {

            var has_header, has_footer, data, content;

            if (response) {
                data = response.custom;

                if (data.header) {
                    content = data.header;
                    if (data.header_type === 'md') {
                        content  = marked(content);
                    }
                    $header.html(content).stop().slideDown(duration);
                    has_header = true;
                }

                if (data.footer) {
                    content = data.footer;
                    if (data.footer_type === 'md') {
                        content  = marked(content);
                    }
                    $footer.html(content).stop().slideDown(duration);
                    has_footer = true;
                }
            }

            if (!has_header) {
                $header.stop().slideUp(duration);
            }
            if (!has_footer) {
                $footer.stop().slideUp(duration);
            }
        });
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $header = $('<div id="content-header"/>').hide().prependTo('#content');
        $footer = $('<div id="content-footer"/>').hide().appendTo('#content');

        event.sub('location.changed', onLocationChanged);
    }


    init();
});
