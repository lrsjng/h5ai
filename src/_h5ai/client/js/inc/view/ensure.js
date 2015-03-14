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
            '<a id="backlink" href="http://larsjung.de/h5ai/" title="h5ai project page">' +
                '<div>powered by</div>' +
                '<div>h5ai ' + config.setup.VERSION + '</div>' +
            '</a>';


    function init() {

        $(templateTopbar).appendTo('body');
        $(templateMainRow).appendTo('body');
        $(templateBacklink).appendTo('#topbar');
    }


    init();
});
