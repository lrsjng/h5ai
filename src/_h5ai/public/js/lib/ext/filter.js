modulejs.define('ext/filter', ['_', '$', 'core/event', 'core/location', 'core/resource', 'core/settings', 'core/util', 'view/view'], function (_, $, event, location, resource, allsettings, util, view) {
    var settings = _.extend({
        enabled: false,
        advanced: false,
        debounceTime: 100
    }, allsettings.filter);
    var template =
            '<div id="filter" class="tool">' +
                '<img src="' + resource.image('filter') + '" alt="filter"/>' +
                '<input class="l10n_ph-filter" type="text" value=""/>' +
            '</div>';
    var inputIsVisible = false;
    var prevPattern = '';
    var $filter;
    var $input;


    function filter(pattern) {
        pattern = pattern || '';
        if (pattern === prevPattern) {
            return;
        }
        prevPattern = pattern;

        if (!pattern) {
            view.setLocation();
            return;
        }

        $filter.addClass('pending');

        var re = new RegExp(pattern);
        var matchedItems = [];

        _.each(location.getItem().content, function (item) {
            if (re.test(item.label)) {
                matchedItems.push(item);
            }
        });

        $filter.removeClass('pending');
        view.setHint('noMatch');
        view.setItems(matchedItems);
    }

    function update() {
        if (inputIsVisible) {
            $filter.addClass('active');
            $input.focus();
            filter(util.parsePattern($input.val(), settings.advanced));
        } else {
            filter();
            $filter.removeClass('active');
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

        $filter = $(template).appendTo('#toolbar');
        $input = $filter.find('input');

        $filter.on('click', 'img', toggle);
        $input.on('keyup', _.debounce(update, settings.debounceTime, {trailing: true}));
        event.sub('location.changed', reset);
    }


    init();
});
