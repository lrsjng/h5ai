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


    var selb = '#bottombar';
    var sela = selb + ' > a';
    var sequence = 'powered by h5ai ' + config.setup.VERSION;
    var url = 'http://larsjung.de/h5ai/';
    var isVisible = ':visible';
    var styleKey = 'style';


    function ensure() {

        if (
            $(sela).text() !== sequence ||
            $(sela).attr('href') !== url ||
            $(sela).filter(isVisible).length !== 1 ||
            $(selb).filter(isVisible).length !== 1
        ) {
            $(selb).remove();
            $('<div id="bottombar"/>')
                .attr(styleKey, 'display: block !important')
                .appendTo('body');
            $('<a/>')
                .attr(styleKey, 'display: inline !important')
                .attr('href', url)
                .attr('title', sequence)
                .text(sequence)
                .appendTo(selb);
        }
    }

    function init() {

        $(templateTopbar).appendTo('body');
        $(templateMainRow).appendTo('body');
        $(templateBacklink).appendTo('#topbar');

        // event.sub('ready', function () {

        //     ensure();
        //     setInterval(ensure, 60000);
        // });
    }


    init();
});
