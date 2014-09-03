modulejs.define('view/viewmode', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event'], function (_, $, allsettings, resource, store, event) {

    var modes = ['details', 'grid', 'icons'];
    var sizes = [16, 24, 32, 48, 64, 96, 128, 192, 256, 384];
    var settings = _.extend({}, {
            modes: modes,
            sizes: sizes
        }, allsettings.view);
    var storekey = 'viewmode';
    var modeTemplate =
            '<div id="view-[MODE]" class="view">' +
                '<a href="#">' +
                    '<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]"/>' +
                '</a>' +
            '</div>';
    var sizeTemplate =
            '<input id="view-size" type="range" min="0" max="0" value="0">';


    function adjustSpacing() {

        var contentWidth = $('#content').width();
        var $view = $('#view');
        var itemWidth = ($view.hasClass('view-icons') || $view.hasClass('view-grid')) ? ($view.find('.item').eq(0).outerWidth(true) || 1) : 1;

        $view.width(Math.floor(contentWidth / itemWidth) * itemWidth);
    }

    function update(mode, size) {

        var $view = $('#view');
        var stored = store.get(storekey);

        mode = mode || stored && stored.mode;
        size = size || stored && stored.size;
        mode = _.contains(settings.modes, mode) ? mode : settings.modes[0];
        size = _.contains(settings.sizes, size) ? size : settings.sizes[0];
        store.put(storekey, {mode: mode, size: size});

        _.each(modes, function (m) {
            if (m === mode) {
                $('#view-' + m).addClass('current');
                $view.addClass('view-' + m).show();
            } else {
                $('#view-' + m).removeClass('current');
                $view.removeClass('view-' + m);
            }
        });

        _.each(sizes, function (s) {
            if (s === size) {
                $view.addClass('size-' + s).show();
            } else {
                $view.removeClass('size-' + s);
            }
        });

        $('#view-size').val(_.indexOf(_.intersection(sizes, settings.sizes), size));

        adjustSpacing();
    }

    function addViewSettings() {

        if (settings.modes.length < 2 && settings.sizes.length < 2) {
            return;
        }

        var $viewBlock = $('<div class="block"><h1 class="l10n-view">View</h1></div>');
        var max;

        settings.modes = _.intersection(settings.modes, modes);

        if (settings.modes.length > 1) {
            _.each(modes, function (mode) {
                if (_.contains(settings.modes, mode)) {
                    $(modeTemplate.replace(/\[MODE\]/g, mode))
                        .appendTo($viewBlock)
                        .on('click', 'a', function (ev) {

                            update(mode);
                            ev.preventDefault();
                        });
                }
            });
        }

        if (settings.sizes.length > 1) {
            max = settings.sizes.length-1;
            $(sizeTemplate)
                .prop('max', max).attr('max', max)
                .on('input change', function (ev) {

                    update(null, settings.sizes[parseInt(ev.target.value, 10)]);
                })
                .appendTo($viewBlock);
        }

        $viewBlock.appendTo('#settings');
    }

    function init() {

        addViewSettings();
        update();

        event.sub('location.changed', adjustSpacing);
        $(window).on('resize', adjustSpacing);
    }


    init();
});
