modulejs.define('view/viewmode', ['_', '$', 'core/resource', 'core/settings', 'core/store', 'view/sidebar', 'view/view'], function (_, $, resource, allsettings, store, sidebar, view) {

    var modes = ['details', 'grid', 'icons'];
    var settings = _.extend({}, {
            modes: modes,
            sizes: [20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400]
        }, allsettings.view);
    var storekey = 'viewmode';
    var modeTemplate =
            '<div id="view-[MODE]" class="button view">' +
                '<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]"/>' +
            '</div>';
    var sizeTemplate =
            '<input id="view-size" type="range" min="0" max="0" value="0">';
    var sortedSizes = settings.sizes.sort(function (a, b) { return a - b; });


    function cropSize(size, min, max) {

        return Math.min(max, Math.max(min, size));
    }

    function createStyles(size) {

        var dsize = cropSize(size, 20, 80);
        var gsize = cropSize(size, 40, 150);
        var isize = cropSize(size, 80, 2000);
        var ilsize = Math.round(isize * 4 / 3);
        var rules = [
                '#view.view-details.view-size-' + size + ' .item .label { line-height: ' + (dsize + 14) + 'px !important; }',
                '#view.view-details.view-size-' + size + ' .item .date { line-height: ' + (dsize + 14) + 'px !important; }',
                '#view.view-details.view-size-' + size + ' .item .size { line-height: ' + (dsize + 14) + 'px !important; }',
                '#view.view-details.view-size-' + size + ' .square { width: ' + dsize + 'px !important; height: ' + dsize + 'px !important; }',
                '#view.view-details.view-size-' + size + ' .square img { width: ' + dsize + 'px !important; height: ' + dsize + 'px !important; }',
                '#view.view-details.view-size-' + size + ' .label { margin: 0 246px 0 ' + (dsize + 32) + 'px !important; }',

                '#view.view-grid.view-size-' + size + ' .item .label { line-height: ' + gsize + 'px !important; }',
                '#view.view-grid.view-size-' + size + ' .square { width: ' + gsize + 'px !important; height: ' + gsize + 'px !important; }',
                '#view.view-grid.view-size-' + size + ' .square img { width: ' + gsize + 'px !important; height: ' + gsize + 'px !important; }',

                '#view.view-icons.view-size-' + size + ' .item { width: ' + ilsize + 'px !important; }',
                '#view.view-icons.view-size-' + size + ' .landscape { width: ' + ilsize + 'px !important; height: ' + isize + 'px !important; }',
                '#view.view-icons.view-size-' + size + ' .landscape img { width: ' + isize + 'px !important; height: ' + isize + 'px !important; }',
                '#view.view-icons.view-size-' + size + ' .landscape .thumb { width: ' + ilsize + 'px !important; }'
            ];

        return rules.join('\n');
    }

    function addCssStyles() {

        var styles = _.map(sortedSizes, function (size) { return createStyles(size); });
        $('<style/>').text(styles.join('\n')).appendTo('head');
    }

    function updateView(mode, size) {

        var stored = store.get(storekey);

        mode = mode || stored && stored.mode;
        size = size || stored && stored.size;
        mode = _.contains(settings.modes, mode) ? mode : settings.modes[0];
        size = _.contains(settings.sizes, size) ? size : settings.sizes[0];
        store.put(storekey, {mode: mode, size: size});

        _.each(modes, function (m) {
            if (m === mode) {
                $('#view-' + m).addClass('active');
                view.$el.addClass('view-' + m);
            } else {
                $('#view-' + m).removeClass('active');
                view.$el.removeClass('view-' + m);
            }
        });

        _.each(sortedSizes, function (s) {
            if (s === size) {
                view.$el.addClass('view-size-' + s);
            } else {
                view.$el.removeClass('view-size-' + s);
            }
        });
        $('#view-size').val(_.indexOf(sortedSizes, size));

        view.$el.show();
    }

    function addViewSettings() {

        if (settings.modes.length < 2 && settings.sizes.length < 2) {
            return;
        }

        var $viewBlock = $('<div id="settings-viewmode" class="block"><h1 class="l10n-view">View</h1></div>');
        var max;

        settings.modes = _.intersection(settings.modes, modes);

        if (settings.modes.length > 1) {
            _.each(modes, function (mode) {
                if (_.contains(settings.modes, mode)) {
                    $(modeTemplate.replace(/\[MODE\]/g, mode))
                        .appendTo($viewBlock)
                        .on('click', function () { updateView(mode); });
                }
            });
        }

        if (settings.sizes.length > 1) {
            max = settings.sizes.length - 1;
            $(sizeTemplate)
                .prop('max', max).attr('max', max)
                .on('input change', function (ev) {

                    updateView(null, settings.sizes[ev.target.valueAsNumber]);
                })
                .appendTo($viewBlock);
        }

        $viewBlock.appendTo(sidebar.$el);
    }

    function init() {

        addCssStyles();
        addViewSettings();
        updateView();
    }


    init();
});
