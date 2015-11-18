modulejs.define('view/mainrow', ['$', 'view/root'], function ($, root) {
    var $el = $('<div id="mainrow"/>').appendTo(root.$el);

    return {
        $el: $el
    };
});
