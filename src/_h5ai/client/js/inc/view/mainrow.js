modulejs.define('view/mainrow', ['$', 'view/root'], function ($, root) {

    var template = '<div id="main-row"/>';
    var $el = $(template).appendTo(root.$el);

    return {
        $el: $el
    };
});
