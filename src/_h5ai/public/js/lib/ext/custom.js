modulejs.define('ext/custom', ['_', '$', 'marked', 'core/event', 'core/server', 'core/settings'], function (_, $, marked, event, server, allsettings) {
    var settings = _.extend({
        enabled: false
    }, allsettings.custom);
    var $header;
    var $footer;
    var duration = 200;


    function onLocationChanged(item) {
        server.request({action: 'get', custom: item.absHref}, function (response) {
            var custom = response && response.custom;
            var hasHeader;
            var hasFooter;

            if (custom) {
                var header = custom.header;
                var footer = custom.footer;
                var content;

                if (header.content) {
                    content = header.content;
                    if (header.type === 'md') {
                        content = marked(content);
                    }
                    $header.html(content).stop().slideDown(duration);
                    hasHeader = true;
                }

                if (footer.content) {
                    content = footer.content;
                    if (footer.type === 'md') {
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
