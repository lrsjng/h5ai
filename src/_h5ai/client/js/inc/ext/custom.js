modulejs.define('ext/custom', ['_', '$', 'marked', 'core/settings', 'core/server', 'core/event'], function (_, $, marked, allsettings, server, event) {

    var settings = _.extend({
            enabled: false
        }, allsettings.custom);
    var $header;
    var $footer;
    var duration = 200;


    function onLocationChanged(item) {

        server.request({action: 'get', custom: true, customHref: item.absHref}, function (response) {

            var hasHeader;
            var hasFooter;
            var data;
            var content;

            if (response) {
                data = response.custom;

                if (data.header) {
                    content = data.header;
                    if (data.header_type === 'md') {
                        content = marked(content);
                    }
                    $header.html(content).stop().slideDown(duration);
                    hasHeader = true;
                }

                if (data.footer) {
                    content = data.footer;
                    if (data.footer_type === 'md') {
                        content = marked(content);
                    }
                    $footer.html(content).stop().slideDown(duration);
                    hasFooter = true;
                }
            }

            if (!hasHeader) {
                $header.stop().slideUp(duration);
            }
            if (!hasFooter) {
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
