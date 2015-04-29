modulejs.define('view/notification', ['$', 'view/root'], function ($, root) {

    var $el = $('<div id="notification"/>');

    function set(content) {

        if (content) {
            $el.stop(true, true).html(content).fadeIn(400);
        } else {
            $el.stop(true, true).fadeOut(400);
        }
    }

    $el.hide().appendTo(root.$el);

    return {
        $el: $el,
        set: set
    };
});
