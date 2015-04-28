modulejs.define('view/notification', ['$'], function ($) {

    var template = '<div id="notification"/>';

    function set(content) {

        if (content) {
            $('#notification').stop(true, true).html(content).fadeIn(400);
        } else {
            $('#notification').stop(true, true).fadeOut(400);
        }
    }

    $(template).hide().appendTo('body');

    return {
        set: set
    };
});
