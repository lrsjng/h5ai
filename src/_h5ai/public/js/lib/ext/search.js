modulejs.define('ext/search', ['_', '$', 'core/event', 'core/location', 'core/resource', 'core/server', 'core/settings', 'core/util', 'model/item', 'view/view'], function (_, $, event, location, resource, server, allsettings, util, Item, view) {
    var settings = _.extend({
        enabled: false,
        advanced: false,
        debounceTime: 300
    }, allsettings.search);
    var template =
            '<div id="search" class="tool">' +
                '<img src="' + resource.image('search') + '" alt="search"/>' +
                '<input class="l10n_ph-search" type="text" value=""/>' +
            '</div>';
    var inputIsVisible = false;
    var prevPattern = '';
    var $search;
    var $input;


    function search(pattern) {
        pattern = pattern || '';
        if (pattern === prevPattern) {
            return;
        }
        prevPattern = pattern;

        if (!pattern) {
            view.setLocation();
            return;
        }

        $search.addClass('pending');

        server.request({
            action: 'get',
            search: {
                href: location.getAbsHref(),
                pattern: pattern
            }
        }, function (response) {
            $search.removeClass('pending');
            view.setHint('noMatch');
            view.setItems(_.map(response.search, function (item) {
                return Item.get(item);
            }));
        });
    }

    function update() {
        if (inputIsVisible) {
            $search.addClass('active');
            $input.focus();
            search(util.parsePattern($input.val(), settings.advanced));
        } else {
            search();
            $search.removeClass('active');
        }
    }

    function toggle() {
        inputIsVisible = !inputIsVisible;
        update();
    }

    function reset() {
        inputIsVisible = false;
        $input.val('');
        update();
    }

    function init() {
        if (!settings.enabled) {
            return;
        }

        $search = $(template).appendTo('#toolbar');
        $input = $search.find('input');

        $search.on('click', 'img', toggle);
        $input.on('keyup', _.debounce(update, settings.debounceTime, {trailing: true}));
        event.sub('location.changed', reset);
    }


    init();
});
