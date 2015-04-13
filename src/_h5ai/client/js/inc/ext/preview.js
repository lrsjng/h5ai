modulejs.define('ext/preview', ['_', '$', 'core/settings', 'core/resource', 'core/store'], function (_, $, allsettings, resource, store) {

    var settings = _.extend({
            enabled: true
        }, allsettings.preview);
    var $window = $(window);
    var template =
            '<div id="pv-overlay">' +
                '<div id="pv-content"/>' +
                '<div id="pv-spinner"><img class="back"/><img class="spinner" src="' + resource.image('spinner') + '"/></div>' +
                '<div id="pv-prev-area" class="hof"><img src="' + resource.image('preview-prev') + '"/></div>' +
                '<div id="pv-next-area" class="hof"><img src="' + resource.image('preview-next') + '"/></div>' +
                '<div id="pv-bottombar" class="clearfix hof">' +
                    '<ul id="pv-buttons">' +
                        '<li id="pv-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview-close') + '"/></li>' +
                        '<li id="pv-bar-raw" class="bar-right"><a class="bar-button" target="_blank"><img src="' + resource.image('preview-raw') + '"/></a></li>' +
                        '<li id="pv-bar-fullscreen" class="bar-right bar-button"><img src="' + resource.image('preview-fullscreen') + '"/></li>' +
                        '<li id="pv-bar-next" class="bar-right bar-button"><img src="' + resource.image('preview-next') + '"/></li>' +
                        '<li id="pv-bar-idx" class="bar-right bar-label"/>' +
                        '<li id="pv-bar-prev" class="bar-right bar-button"><img src="' + resource.image('preview-prev') + '"/></li>' +
                    '</ul>' +
                '</div>' +
            '</div>';
    var storekey = 'ext/preview';
    var isFullscreen = store.get(storekey) || false;
    var userAliveTimeoutId = null;
    var onIndexChange = null;
    var onAdjustSize = null;
    var spinnerVisible = false;


    function adjustSize() {

        var winWidth = $window.width();
        var winHeight = $window.height();
        var $container = $('#pv-content');
        var $spinner = $('#pv-spinner');
        var margin = isFullscreen ? 0 : 20;
        var barHeight = isFullscreen ? 0 : 48;

        $container.css({
            width: winWidth - 2 * margin,
            height: winHeight - 2 * margin - barHeight,
            left: margin,
            top: margin
        });

        $spinner.css({
            left: winWidth * 0.5,
            top: winHeight * 0.5
        });

        if (isFullscreen) {
            $('#pv-overlay').addClass('fullscreen');
            $('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview-no-fullscreen'));
        } else {
            $('#pv-overlay').removeClass('fullscreen');
            $('#pv-bar-fullscreen').find('img').attr('src', resource.image('preview-fullscreen'));
        }

        if (_.isFunction(onAdjustSize)) {
            onAdjustSize(1);
        }
    }

    function onEnter() {

        $('#pv-content').empty();
        setLabels([]);
        $('#pv-overlay').stop(true, true).fadeIn(200);
        $window.on('keydown', onKeydown);

        adjustSize();
    }

    function onExit() {

        $window.off('keydown', onKeydown);
        $('#pv-overlay').stop(true, true).fadeOut(200, function () {
            $('#pv-content').empty();
            setLabels([]);
        });
    }

    function onNext() {

        if (_.isFunction(onIndexChange)) {
            onIndexChange(1);
        }
    }

    function onPrevious() {

        if (_.isFunction(onIndexChange)) {
            onIndexChange(-1);
        }
    }

    function userAlive() {

        clearTimeout(userAliveTimeoutId);
        $('#pv-overlay .hof').stop(true, true).fadeIn(200);

        if (isFullscreen) {
            userAliveTimeoutId = setTimeout(function () {

                $('#pv-overlay .hof').stop(true, true).fadeOut(2000);
            }, 2000);
        }
    }

    function onFullscreen() {

        isFullscreen = !isFullscreen;
        store.put(storekey, isFullscreen);

        userAlive();
        adjustSize();
    }

    function onKeydown(ev) {

        var key = ev.which;

        if (key === 27) { // esc
            ev.preventDefault();
            ev.stopImmediatePropagation();
            onExit();
        } else if (key === 8 || key === 37) { // backspace, left
            ev.preventDefault();
            ev.stopImmediatePropagation();
            onPrevious();
        } else if (key === 13 || key === 32 || key === 39) { // enter, space, right
            ev.preventDefault();
            ev.stopImmediatePropagation();
            onNext();
        } else if (key === 70) { // f
            ev.preventDefault();
            ev.stopImmediatePropagation();
            onFullscreen();
        }
    }

    function setIndex(idx, total) {

        if (_.isNumber(idx)) {
            $('#pv-bar-idx').text(String(idx) + (_.isNumber(total) ? '/' + String(total) : '')).show();
        } else {
            $('#pv-bar-idx').text('').hide();
        }
    }

    function setRawLink(href) {

        if (href) {
            $('#pv-bar-raw').find('a').attr('href', href).end().show();
        } else {
            $('#pv-bar-raw').find('a').attr('href', '#').end().hide();
        }
    }

    function setLabels(labels) {

        $('#pv-buttons .bar-left').remove();
        _.each(labels, function (label) {

            $('<li/>')
                .addClass('bar-left bar-label')
                .text(label)
                .appendTo('#pv-buttons');
        });
    }

    function setOnIndexChange(fn) {

        onIndexChange = fn;
    }

    function setOnAdjustSize(fn) {

        onAdjustSize = fn;
    }

    function showSpinner(show, src, millis) {

        if (!_.isNumber(millis)) {
            millis = 300;
        }

        var $spinner = $('#pv-spinner').stop(true, true);
        var $back = $spinner.find('.back');

        if (show) {
            if (src) {
                $back.attr('src', src).show();
            } else {
                $back.hide();
            }
            spinnerVisible = true;
            $spinner.fadeIn(millis);
        } else {
            spinnerVisible = false;
            $spinner.fadeOut(millis);
        }
    }

    function isSpinnerVisible() {

        return spinnerVisible;
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $(template).appendTo('body');

        $('#pv-spinner').hide();
        $('#pv-bar-prev, #pv-prev-area').on('click', onPrevious);
        $('#pv-bar-next, #pv-next-area').on('click', onNext);
        $('#pv-bar-close').on('click', onExit);
        $('#pv-bar-fullscreen').on('click', onFullscreen);

        $('#pv-overlay')
            .on('keydown', onKeydown)
            .on('mousemove mousedown', userAlive)
            .on('click mousedown mousemove keydown keypress', function (ev) {

                if (ev.type === 'click' && (ev.target.id === 'pv-overlay' || ev.target.id === 'pv-content')) {
                    onExit();
                }
                ev.stopImmediatePropagation();
            });

        $window.on('resize load', adjustSize);
    }


    init();

    return {
        enter: onEnter,
        exit: onExit,
        setIndex: setIndex,
        setRawLink: setRawLink,
        setLabels: setLabels,
        setOnIndexChange: setOnIndexChange,
        setOnAdjustSize: setOnAdjustSize,
        showSpinner: showSpinner,
        isSpinnerVisible: isSpinnerVisible
    };
});
