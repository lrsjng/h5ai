modulejs.define('view/mainrow', ['$', 'view/root'], function ($, root) {

    var template = '<div id="mainrow"/>';
    var $el = $(template).appendTo(root.$el);

    return {
        $el: $el
    };
});
