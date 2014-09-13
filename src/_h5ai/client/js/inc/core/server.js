modulejs.define('core/server', ['$', '_', 'config', 'core/location'], function ($, _, config, location) {

    var hasApi = config.setup.API === true;


    function request(data, callback) {

        if (hasApi) {
            $.ajax({
                    url: location.getAbsHref(),
                    data: data,
                    type: 'POST',
                    dataType: 'json'
                })
                .done(function (json) {

                    callback(json);
                })
                .fail(function () {

                    callback();
                });
        } else {
            callback();
        }
    }

    function formRequest(data) {

        if (hasApi) {
            var $form = $('<form method="post" style="display:none;"/>')
                            .attr('action', location.getAbsHref());

            _.each(data, function (val, key) {

                $('<input type="hidden"/>')
                    .attr('name', key)
                    .attr('value', val)
                    .appendTo($form);
            });

            $form.appendTo('body').submit().remove();
        }
    }


    return {
        backend: config.setup.BACKEND,
        api: hasApi,
        name: config.setup.SERVER_NAME,
        version: config.setup.SERVER_VERSION,
        request: request,
        formRequest: formRequest
    };
});
