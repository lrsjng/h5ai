modulejs.define('view/content', ['$', 'view/mainrow'], function ($, mainrow) {
    var $el = $('<div id="content"/>').appendTo(mainrow.$el);

    return {
        $el: $el
    };
});
