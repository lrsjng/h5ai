modulejs.define('ext/filter', ['_', '$', 'core/settings', 'core/resource', 'core/event'], function (_, $, allsettings, resource, event) {

    var settings = _.extend({
            enabled: false
        }, allsettings.filter);
    var template =
            '<li id="filter">' +
                '<span class="element">' +
                    '<img src="' + resource.image('filter') + '" alt="filter"/>' +
                    '<input type="text" value="" placeholder="filter"/>' +
                '</span>' +
            '</li>';
    var noMatchTemplate = '<div class="no-match l10n-noMatch"/>';
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

    function reset() {

        $input.val('').blur();
    }

    function update(focus) {

        var val = $input.val();

        if (focus) {
            $input.focus();
        }

        if (val || focus) {
            filter(parseFilterSequence(val));
            $filter.addClass('current');
        } else {
            filter();
            $filter.removeClass('current');
        }
    }

    function updt() {

        update(true);
    }

    function updf() {

        update(false);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $filter = $(template).appendTo('#navbar');
        $input = $filter.find('input');
        $noMatch = $(noMatchTemplate).appendTo('#view');

        $filter.on('click', updt);
        $input.on('focus blur keyup', updf);

        $(document)
            .on('keydown', function (event) {

                if (event.which === 27) {
                    reset();
                }
            })
            .on('keypress', updt);

        event.sub('location.changed', reset);
    }


    init();
});
