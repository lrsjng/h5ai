modulejs.define('view/ensure', ['$', 'config', 'core/event'], function ($, config, event) {

    var selb = '#bottombar';
    var selr = selb + ' .right';
    var sela = selr + ' a';
    var sequence = 'powered by h5ai ' + config.setup.VERSION;
    var url = 'http://larsjung.de/h5ai/';
    var isVisible = ':visible';
    var styleKey = 'style';
    var styleVal = 'display: inline !important';


    function ensure() {

        if (
            $(selr).text() !== sequence ||
            $(sela).attr('href') !== url ||
            $(sela).filter(isVisible).length !== 1 ||
            $(selr).filter(isVisible).length !== 1 ||
            $(selb).filter(isVisible).length !== 1
        ) {
            if ($(selb).filter(isVisible).length !== 1) {
                $(selb).remove();
                $('<div id="bottombar"/>').attr(styleKey, styleVal).appendTo('body');
            }
            $(selr).remove();
            $('<span><a/></span>')
                .addClass('right')
                .attr(styleKey, styleVal)
                .find('a')
                    .attr('href', url)
                    .attr('title', sequence)
                    .text(sequence)
                    .attr(styleKey, styleVal)
                .end()
                .prependTo(selb);
        }
    }

    function init() {

        event.sub('ready', function () {

            ensure();
            setInterval(ensure, 60000);
        });
    }


    init();
});
