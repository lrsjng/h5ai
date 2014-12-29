modulejs.define('ext/tree', ['_', '$', 'core/settings', 'core/resource', 'core/store', 'core/event', 'core/location'], function (_, $, allsettings, resource, store, event, location) {

    var settings = _.extend({
            enabled: false,
            maxSubfolders: 50
        }, allsettings.tree);
    var template =
            '<div class="item">' +
                '<span class="indicator none">' +
                    '<img src="' + resource.image('tree-indicator') + '"/>' +
                '</span>' +
                '<a>' +
                    '<span class="icon"><img/></span>' +
                    '<span class="label"/>' +
                '</a>' +
            '</span>';
    var settingsTemplate =
            '<div class="block">' +
                '<h1 class="l10n-tree">Tree</h1>' +
                '<div id="view-tree" class="button view">' +
                    '<img src="' + resource.image('tree-toggle') + '" alt="view-tree"/>' +
                '</div>' +
            '</div>';
    var storekey = 'ext/tree';


    function update(item) {

        var $html = $(template);
        var $indicator = $html.find('.indicator');
        var $a = $html.find('a');
        var $img = $html.find('.icon img');
        var $label = $html.find('.label');

        $html
            .addClass(item.isFolder() ? 'folder' : 'file')
            .data('item', item);

        location.setLink($a, item);
        $img.attr('src', resource.icon('folder'));
        $label.text(item.label);

        if (item.isFolder()) {

            var subfolders = item.getSubfolders();

            // indicator
            if ((item.isManaged && !item.isContentFetched) || subfolders.length) {

                $indicator.removeClass('none');

                if ((item.isManaged && !item.isContentFetched)) {
                    $indicator.addClass('unknown');
                } else if (item.isContentVisible) {
                    $indicator.addClass('open');
                } else {
                    $indicator.addClass('close');
                }
            }

            // is it the current folder?
            if (item.isCurrentFolder()) {
                $html.addClass('active');
            }

            // does it have subfolders?
            if (subfolders.length) {
                var $ul = $('<ul class="content"/>').appendTo($html);
                var counter = 0;
                _.each(subfolders, function (e) {
                    counter += 1;
                    if (counter <= settings.maxSubfolders) {
                        $('<li/>').append(update(e)).appendTo($ul);
                    }
                });
                if (subfolders.length > settings.maxSubfolders) {
                    $('<li class="summary">… ' + (subfolders.length - settings.maxSubfolders) + ' more subfolders</li>').appendTo($ul);
                }
                if (!item.isContentVisible) {
                    $ul.hide();
                }
            }

            // reflect folder status
            if (!item.isManaged) {
                $img.attr('src', resource.icon('folder-page'));
            }
        }

        if (item.$tree) {
            item.$tree.replaceWith($html);
        }
        item.$tree = $html;

        return $html;
    }

    function createOnIndicatorClick() {

        var $tree = $('#tree');

        function slide(item, $indicator, $content, down) {

            item.isContentVisible = down;
            $indicator.removeClass('open close').addClass(down ? 'open' : 'close');
            $content[down ? 'slideDown' : 'slideUp']();
        }

        return function () {

            var $indicator = $(this);
            var $item = $indicator.closest('.item');
            var item = $item.data('item');
            var $content = $item.find('> ul.content');

            if ($indicator.hasClass('unknown')) {

                item.fetchContent(function (item) {

                    item.isContentVisible = false;

                    var $item = update(item);
                    var $indicator = $item.find('> .indicator');
                    var $content = $item.find('> ul.content');

                    if (!$indicator.hasClass('none')) {
                        slide(item, $indicator, $content, true);
                    }
                });

            } else if ($indicator.hasClass('open')) {

                slide(item, $indicator, $content, false);

            } else if ($indicator.hasClass('close'))  {

                slide(item, $indicator, $content, true);
            }
        };
    }

    function fetchTree(item, callback) {

        item.isContentVisible = true;
        item.fetchContent(function (item) {

            if (item.parent) {
                fetchTree(item.parent, callback);
            } else {
                callback(item);
            }
        });
    }

    function updateSettings() {

        if (store.get(storekey)) {
            $('#view-tree').addClass('active');
            $('#tree').show();
        } else {
            $('#view-tree').removeClass('active');
            $('#tree').hide();
        }
    }

    function onLocationChanged(item) {

        fetchTree(item, function (root) {

            $('#tree').append(update(root));
            updateSettings();
        });
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $('<div id="tree"/>')
            .appendTo('#main-row')
            .on('click', '.indicator', createOnIndicatorClick());

        $(settingsTemplate)
            .appendTo('#settings')
            .find('#view-tree')
            .on('click', function (ev) {

                store.put(storekey, !store.get(storekey));
                updateSettings();
                ev.preventDefault();
            });

        // ensure stored value is boolean, default to true
        store.put(storekey, store.get(storekey) !== false);
        updateSettings();

        event.sub('location.changed', onLocationChanged);
    }


    init();
});
