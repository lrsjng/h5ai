modulejs.define('core/server', ['_', '$'], function (_, $) {
    function request(data, callback) {
        $.ajax({
            url: '?',
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
        var $form = $('<form method="post" action="?" style="display:none;"/>');

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
