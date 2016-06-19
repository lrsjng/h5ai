const {jq, lo} = require('./globals');

function request(data) {
    return new Promise(resolve => {
        jq.ajax({
            url: '?',
            data,
            type: 'post',
            dataType: 'json'
        })
        .done(json => resolve(json))
        .fail(() => resolve());
    });
}

function formRequest(data) {
    const $form = jq('<form method="post" action="?" style="display:none;"/>');

    lo.each(data, (val, key) => {
        jq('<input type="hidden"/>')
            .attr('name', key)
            .attr('value', val)
            .appendTo($form);
    });

    $form.appendTo('body').submit().remove();
}

module.exports = {
    request,
    formRequest
};
