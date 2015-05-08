modulejs.define('ext/search', ['_', '$', 'core/event', 'core/location', 'core/resource', 'core/server', 'core/settings', 'model/item', 'view/view'], function (_, $, event, location, resource, server, allsettings, Item, view) {

    var settings = _.extend({
            enabled: false,
            debounceTime: 300
        }, allsettings.search);
    var template =
            '<div id="search" class="tool">' +
                '<img src="' + resource.image('search') + '" alt="search"/>' +
                '<input type="text" value="" placeholder="search"/>' +
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
            view.setItems('search', _.map(response.search, function (item) {

                return Item.get(item);
            }));
        });
    }

    function escapeRegExp(sequence) {

        return sequence.replace(/[\-\[\]{}()*+?.,\\$\^|#\s]/g, '\\$&');
    }

    function parseInput(sequence) {

        if (sequence.substr(0, 3) === 're:') {
            return sequence.substr(3);
        }

        return escapeRegExp(sequence);

        // sequence = $.map($.trim(sequence).split(/\s+/), function (part) {

        //     return _.map(part.split(''), function (character) {

        //         return escapeRegExp(character);
        //     }).join('.*?');
        // }).join('|');

        // return sequence;
    }

    function update() {

        if (inputIsVisible) {
            $search.addClass('active');
            $input.focus();
            search(parseInput($input.val()));
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
