modulejs.define('view/topbar', ['$', 'core/settings', 'view/root'], function ($, settings, root) {

    var template =
            '<div id="topbar">' +
                '<div id="toolbar"/>' +
                '<div id="flowbar"/>' +
                '<a id="backlink" href="http://larsjung.de/h5ai/" title="powered by h5ai ' + settings.version + '">' +
                    '<div>powered</div>' +
                    '<div>by h5ai</div>' +
                '</a>' +
            '</div>';
    var $el = $(template).appendTo(root.$el);

    return {
        $el: $el,
        $toolbar: $el.find('#toolbar'),
        $flowbar: $el.find('#flowbar')
    };
});
