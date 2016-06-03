const {jq, lo, marked} = require('../globals');
const event = require('../core/event');
const server = require('../core/server');
const allsettings = require('../core/settings');


const settings = lo.extend({
    enabled: false
}, allsettings.custom);
let $header;
let $footer;
const duration = 200;


function onLocationChanged(item) {
    server.request({action: 'get', custom: item.absHref}).then(response => {
        const custom = response && response.custom;
        let hasHeader;
        let hasFooter;

        if (custom) {
            const header = custom.header;
            const footer = custom.footer;
            let content;

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

    $header = jq('<div id="content-header"/>').hide().prependTo('#content');
    $footer = jq('<div id="content-footer"/>').hide().appendTo('#content');

    event.sub('location.changed', onLocationChanged);
}


init();
