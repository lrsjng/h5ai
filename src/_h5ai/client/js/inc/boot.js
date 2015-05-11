modulejs.define('boot', ['$'], function ($) {

    if ($('html').hasClass('no-browser')) {
        return;
    }

    var module = $('script[data-module]').data('module');
    var data = {action: 'get', setup: true, options: true, types: true, theme: true, langs: true};
    var href;

    if (module === 'index') {
        href = '.';
    } else if (module === 'info') {
        data.updateCachedSetup = true;
        href = 'server/php/index.php';
    } else {
        return;
    }

    $.ajax({
        url: href,
        data: data,
        type: 'post',
        dataType: 'json'
    }).done(function (config) {

        modulejs.define('config', config);
        $(function () { modulejs.require('main/' + module); });
    });
});
