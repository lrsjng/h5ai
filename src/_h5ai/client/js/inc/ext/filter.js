modulejs.define('ext/filter', ['_', '$', 'core/settings', 'core/resource', 'core/event'], function (_, $, allsettings, resource, event) {

    var settings = _.extend({
            enabled: false
        }, allsettings.filter);
    var template =
            '<div id="filter" class="tool">' +
                '<img src="' + resource.image('filter') + '" alt="filter"/>' +
                '<input type="text" value="" placeholder="filter"/>' +
            '</div>';
    var noMatchTemplate = '<div class="no-match l10n-noMatch"/>';
    var inputIsVisible = false;
    var $filter, $input, $noMatch;


    function filter(re) {

        var match = [];
        var noMatch = [];
        var duration = 200;

        if (re) {
            $('#items .item').not('.folder-parent').each(function () {

                var label = $(this).find('.label').text();

                if (label.match(re)) {
                    match.push(this);
                } else {
                    noMatch.push(this);
                }
            });
        } else {
            match = $('#items .item').not('.folder-parent');
        }

        if (match.length) {
            $noMatch.hide();
        } else if (noMatch.length) {
            setTimeout(function () { $noMatch.show(); }, duration);
        }
        $(match).fadeIn(duration);
        $(noMatch).fadeOut(duration);
    }

    function escapeRegExp(sequence) {

        return sequence.replace(/[\-\[\]{}()*+?.,\\$\^|#\s]/g, '\\$&');
    }

    function parseFilterSequence(sequence) {

        if (sequence.substr(0, 3) === 're:') {
            return new RegExp(sequence.substr(3));
        }

        sequence = $.map($.trim(sequence).split(/\s+/), function (part) {

            return _.map(part.split(''), function (character) {

                return escapeRegExp(character);
            }).join('.*?');
        }).join('|');

        return new RegExp(sequence, 'i');
    }

    function update() {

        if (inputIsVisible) {
            var val = $input.val();
            filter(parseFilterSequence(val));
            $filter.addClass('active');
            $input.focus();
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

        $input.val('');
        update();
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $filter = $(template).appendTo('#toolbar');
        $input = $filter.find('input');
        $noMatch = $(noMatchTemplate).appendTo('#view');

        $filter.on('click', 'img', toggle);
        $input.on('keyup', update);
        event.sub('location.changed', reset);
    }


    init();
});
