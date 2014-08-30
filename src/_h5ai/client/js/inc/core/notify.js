modulejs.define('core/notify', ['$'], function ($) {

    var template = '<div id="notify"/>';

    function set(content) {

        if (content) {
            $('#notify').stop(true, true).html(content).fadeIn(400);
        } else {
            $('#notify').stop(true, true).fadeOut(400);
        }
    }

    $(template).hide().appendTo('body');

    return {
        set: set
    };
});
