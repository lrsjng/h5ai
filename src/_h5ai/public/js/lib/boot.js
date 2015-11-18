modulejs.define('boot', ['$', 'core/server'], function ($, server) {
    var module = $('script[data-module]').data('module');
    var data = {
        action: 'get',
        setup: true,
        options: true,
        types: true
    };

    if (module === 'index') {
        data.theme = true;
        data.langs = true;
    } else if (module === 'info') {
        data.refresh = true;
    } else {
        return;
    }

    server.request(data, function (config) {
        modulejs.define('config', config);
        $(function () {
            modulejs.require('main/' + module);
        });
    });
});
