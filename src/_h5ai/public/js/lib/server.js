const {jq} = require('./globals');

const each = (obj, fn) => Object.keys(obj).forEach(key => fn(obj[key], key));

const request = data => {
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
};

const formRequest = data => {
    const $form = jq('<form method="post" action="?" style="display:none;"/>');

    each(data, (val, key) => {
        jq('<input type="hidden"/>')
            .attr('name', key)
            .attr('value', val)
            .appendTo($form);
    });

    $form.appendTo('body').submit().remove();
};

module.exports = {
    request,
    formRequest
};
