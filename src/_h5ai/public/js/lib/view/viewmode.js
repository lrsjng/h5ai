modulejs.define('view/viewmode', ['_', '$', 'core/event', 'core/resource', 'core/settings', 'view/sidebar', 'view/topbar', 'view/view'], function (_, $, event, resource, allsettings, sidebar, topbar, view) {
    var settings = _.extend({
        modeToggle: false
    }, allsettings.view);
    var tplSettings =
            '<div id="viewmode-settings" class="block"><h1 class="l10n-view">View</h1></div>';
    var tplMode =
            '<div id="viewmode-[MODE]" class="button mode">' +
                '<img src="' + resource.image('view-[MODE]') + '" alt="viewmode-[MODE]"/>' +
            '</div>';
    var tplSize =
            '<input id="viewmode-size" type="range" min="0" max="0" value="0">';
    var tplToggle =
            '<div id="viewmode-toggle" class="tool">' +
                '<img alt="viewmode"/>' +
            '</div>';
    var modes;
    var sizes;


    function onChanged(mode, size) {
        $('#viewmode-settings .mode').removeClass('active');
        $('#viewmode-' + mode).addClass('active');
        $('#viewmode-size').val(_.indexOf(sizes, size));

        if (settings.modeToggle === 'next') {
            mode = modes[(modes.indexOf(mode) + 1) % modes.length];
        }
        $('#viewmode-toggle img').attr('src', resource.image('view-' + mode));
    }

    function addSettings() {
        if (modes.length < 2 && sizes.length < 2) {
            return;
        }

        var $viewBlock = $(tplSettings);

        if (modes.length > 1) {
            _.each(modes, function (mode) {
                $(tplMode.replace(/\[MODE\]/g, mode))
                    .on('click', function () {
                        view.setMode(mode);
                    })
                    .appendTo($viewBlock);
            });
        }

        if (sizes.length > 1) {
            var max = sizes.length - 1;
            $(tplSize)
                .prop('max', max).attr('max', max)
                .on('input change', function (ev) {
                    view.setSize(sizes[ev.target.valueAsNumber]);
                })
                .appendTo($viewBlock);
        }

        $viewBlock.appendTo(sidebar.$el);
    }

    function onToggle() {
        var mode = view.getMode();
        var nextIdx = (modes.indexOf(mode) + 1) % modes.length;
        var nextMode = modes[nextIdx];

        view.setMode(nextMode);
    }

    function addToggle() {
        if (settings.modeToggle && modes.length > 1) {
            $(tplToggle)
                .on('click', onToggle)
                .appendTo(topbar.$toolbar);
        }
    }

    function init() {
        modes = view.getModes();
        sizes = view.getSizes();

        addSettings();
        addToggle();
        onChanged(view.getMode(), view.getSize());

        event.sub('view.mode.changed', onChanged);
    }


    init();
});
