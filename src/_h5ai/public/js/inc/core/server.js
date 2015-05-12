modulejs.define('core/server', ['_', '$', 'core/location'], function (_, $, location) {

    function request(data, callback) {

        $.ajax({
            url: location.getAbsHref(),
            data: data,
            type: 'post',
            dataType: 'json'
        })
        .done(function (json) {

            callback(json);
        })
        .fail(function () {

            callback();
        });
    }

    function formRequest(data) {

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


    return {
        request: request,
        formRequest: formRequest
    };
});
