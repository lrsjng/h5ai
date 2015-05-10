modulejs.define('view/viewmode', ['_', '$', 'core/event', 'core/resource', 'view/sidebar', 'view/topbar', 'view/view'], function (_, $, event, resource, sidebar, topbar, view) {

    var tplSettings =
            '<div id="settings-viewmode" class="block"><h1 class="l10n-view">View</h1></div>';
    var tplMode =
            '<div id="view-[MODE]" class="button view">' +
                '<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]"/>' +
            '</div>';
    var tplSize =
            '<input id="view-size" type="range" min="0" max="0" value="0">';
    var tplToggle =
            '<div id="viewmode-toggle" class="tool">' +
                '<img alt="viewmode"/>' +
            '</div>';
    var modes = view.getModes();
    var sizes = view.getSizes();


    function onChanged(mode, size) {

        _.each(modes, function (m) {
            if (m === mode) {
                $('#view-' + m).addClass('active');
            } else {
                $('#view-' + m).removeClass('active');
            }
        });

        $('#view-size').val(_.indexOf(sizes, size));

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

    function addToggle() {

        if (modes.length > 1) {
            $(tplToggle)
                .on('click', function () {

                    var mode = view.getMode();
                    var nextIdx = (modes.indexOf(mode) + 1) % modes.length;
                    var nextMode = modes[nextIdx];

                    view.setMode(nextMode);
                })
                .appendTo(topbar.$toolbar);
        }
    }

    function init() {

        addSettings();
        addToggle();
        onChanged(view.getMode(), view.getSize());

        event.sub('view.mode.changed', onChanged);
    }


    init();
});
