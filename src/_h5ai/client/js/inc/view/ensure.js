modulejs.define('view/ensure', ['$', 'config', 'core/event'], function ($, config, event) {

    var templateTopbar =
            '<div id="topbar">' +
                '<div id="toolbar"/>' +
                '<div id="crumbbar"/>' +
            '</div>';
    var templateMainRow =
            '<div id="main-row">' +
                '<div id="sidebar">' +
                    '<div id="settings"/>' +
                '</div>' +
            '</div>';
    var templateBacklink =
            '<a id="backlink" href="http://larsjung.de/h5ai/" title="powered by h5ai ' + config.setup.VERSION + '">' +
                '<div>powered</div>' +
                '<div>by h5ai</div>' +
            '</a>';


    function init() {

        $('#fallback, #fallback-hints').remove();
        $(templateTopbar).appendTo('body');
        $(templateMainRow).appendTo('body');
        $(templateBacklink).appendTo('#topbar');
    }


    init();
});
