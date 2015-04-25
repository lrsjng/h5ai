modulejs.define('view/topbar', ['$', 'config', 'view/root'], function ($, config, root) {

    var template =
            '<div id="topbar">' +
                '<div id="toolbar"/>' +
                '<div id="crumbbar"/>' +
                '<a id="backlink" href="http://larsjung.de/h5ai/" title="powered by h5ai ' + config.setup.VERSION + '">' +
                    '<div>powered</div>' +
                    '<div>by h5ai</div>' +
                '</a>' +
            '</div>';
    var $el = $(template).appendTo(root.$el);

    return {
        $el: $el,
        $toolbar: $el.find('#toolbar'),
        $crumbbar: $el.find('#crumbbar')
    };
});
