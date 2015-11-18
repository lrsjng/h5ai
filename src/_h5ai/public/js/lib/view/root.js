modulejs.define('view/root', ['$'], function ($) {
    var $el = $('body').attr('id', 'root');

    $('#fallback, #fallback-hints').remove();

    return {
        $el: $el
    };
});
