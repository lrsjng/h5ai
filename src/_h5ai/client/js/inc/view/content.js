modulejs.define('view/content', ['$', 'view/mainrow'], function ($, mainrow) {

    var $content = $('<div id="content"/>').appendTo(mainrow.$el);

    return {
        $el: $content
    };
});
