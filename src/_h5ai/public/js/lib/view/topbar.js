modulejs.define('view/topbar', ['$', 'view/root'], function ($, root) {
    var tplTopbar =
            '<div id="topbar">' +
                '<div id="toolbar"/>' +
                '<div id="flowbar"/>' +
                '<a id="backlink" href="https://larsjung.de/h5ai/" title="powered by h5ai - https://larsjung.de/h5ai/">' +
                    '<div>powered</div>' +
                    '<div>by h5ai</div>' +
                '</a>' +
            '</div>';
    var $el = $(tplTopbar).appendTo(root.$el);

    return {
        $el: $el,
        $toolbar: $el.find('#toolbar'),
        $flowbar: $el.find('#flowbar')
    };
});
