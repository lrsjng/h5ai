modulejs.define('boot', ['$'], function ($) {

    if ($('html').hasClass('no-browser')) {
        return;
    }

    var module = $('script[data-module]').data('module');
    var data = {action: 'get', setup: true, options: true, types: true, theme: true, langs: true};
    var url;

    if (module === 'index') {
        url = '.';
    } else if (module === 'info') {
        data.updatecmds = true;
        url = 'server/php/index.php';
    } else {
        return;
    }

    $.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: 'json'
    }).done(function (config) {

        modulejs.define('config', config);
        $(function () { modulejs.require('main/' + module); });
    });
});
