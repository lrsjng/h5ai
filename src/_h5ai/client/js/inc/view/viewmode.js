modulejs.define('view/viewmode', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event'], function (_, $, allsettings, resource, store, event) {

    var modes = ['details', 'grid', 'icons'];
    var settings = _.extend({}, {
            modes: modes,
            sizes: [20, 40, 60, 80, 100, 150, 200],
        }, allsettings.view);
    var storekey = 'viewmode';
    var modeTemplate =
            '<div id="view-[MODE]" class="button view">' +
                '<img src="' + resource.image('view-[MODE]') + '" alt="view-[MODE]"/>' +
            '</div>';
    var sizeTemplate =
            '<input id="view-size" type="range" min="0" max="0" value="0">';
    var sortedSizes = settings.sizes.sort(function (a, b) { return a-b; });
    var dynamicStyleTag = null;


    function adjustSpacing() {

        // kept here for later use
    }

    function applyCss(rules) {

        if (dynamicStyleTag) {
            document.head.removeChild(dynamicStyleTag);
        }
        dynamicStyleTag = document.createElement('style');
        dynamicStyleTag.appendChild(document.createTextNode('')); // fix webkit
        document.head.appendChild(dynamicStyleTag);
        _.each(rules, function (rule, i) {

            dynamicStyleTag.sheet.insertRule(rule, i);
        });
    }

    function cropSize(size, min, max) {

        min = min || 4;
        max = max || 2048;
        return Math.min(max, Math.max(min, size));
    }

    function applyCssSizes(size) {

        var dsize = cropSize(size, 10, 80);
        var gsize = cropSize(size, 40, 150);
        var isize = cropSize(size, 80);
        var ilsize = Math.round(isize*4/3);
        var rules = [
                '#view.view-details .item .label { line-height: ' + (dsize+14) + 'px !important; }',
                '#view.view-details .item .date { line-height: ' + (dsize+14) + 'px !important; }',
                '#view.view-details .item .size { line-height: ' + (dsize+14) + 'px !important; }',
                '#view.view-details .square { width: ' + dsize + 'px !important; height: ' + dsize + 'px !important; }',
                '#view.view-details .square img { width: ' + dsize + 'px !important; height: ' + dsize + 'px !important; }',
                '#view.view-details .label { margin: 0 246px 0 ' + (dsize+32) + 'px !important; }',

                '#view.view-grid .item .label { line-height: ' + gsize + 'px !important; }',
                '#view.view-grid .square { width: ' + gsize + 'px !important; height: ' + gsize + 'px !important; }',
                '#view.view-grid .square img { width: ' + gsize + 'px !important; height: ' + gsize + 'px !important; }',

                '#view.view-icons .item { width: ' + ilsize + 'px !important; }',
                '#view.view-icons .landscape { width: ' + ilsize + 'px !important; height: ' + isize + 'px !important; }',
                '#view.view-icons .landscape img { width: ' + isize + 'px !important; height: ' + isize + 'px !important; }',
                '#view.view-icons .landscape .thumb { width: ' + ilsize + 'px !important; }'
            ];
        applyCss(rules);
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
                $('#view-' + m).addClass('active');
                $view.addClass('view-' + m).show();
            } else {
                $('#view-' + m).removeClass('active');
                $view.removeClass('view-' + m);
            }
        });

        applyCssSizes(size);
        $('#view-size').val(_.indexOf(sortedSizes, size));

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
                        .on('click', function (ev) {

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
