
modulejs.define('ext/filter', ['_', '$', 'core/settings', 'core/resource'], function (_, $, allsettings, resource) {

	var settings = _.extend({
			enabled: false
		}, allsettings.filter),

		template = '<li id="filter">' +
						'<span class="element">' +
							'<img src="' + resource.image('filter') + '" alt="filter"/>' +
							'<input type="text" value="" placeholder="filter"/>' +
						'</span>' +
					'</li>',
		noMatchTemplate = '<div class="no-match l10n-noMatch"/>',

		$filter, $input, $noMatch,

		filter = function (re) {

			var match = [],
				noMatch = [],
				duration = 200;

			if (re) {
				$('#items .item').each(function () {

					var label = $(this).find('.label').text();

					if (label.match(re)) {
						match.push(this);
					} else {
						noMatch.push(this);
					}
				});
			} else {
				match = $('#items .item');
			}

			if ($(match).length) {
				$noMatch.hide();
			} else {
				setTimeout(function () { $noMatch.show(); }, duration);
			}
			$(match).fadeIn(duration);
			$(noMatch).fadeOut(duration);
		},

		escapeRegExp = function (sequence) {

			return sequence.replace(/[\-\[\]{}()*+?.,\\$\^|#\s]/g, '\\$&');
		},

		parseFilterSequence = function (sequence) {

			if (sequence.substr(0, 3) === 're:') {
				return new RegExp(sequence.substr(3));
			}

			sequence = $.map($.trim(sequence).split(/\s+/), function (part) {

				return _.map(part.split(''), function (char) {

					return escapeRegExp(char);
				}).join('.*?');
			}).join('|');

			return new RegExp(sequence, 'i');
		},

		update = function () {

			var val = $input.val();

			if (val) {
				filter(parseFilterSequence(val));
				$filter.addClass('current');
			} else {
				filter();
				$filter.removeClass('current');
			}
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$filter = $(template).appendTo('#navbar');
			$input = $filter.find('input');
			$noMatch = $(noMatchTemplate).appendTo('#view');

			$filter
				.on('click', function () {

					$input.focus();
				});

			$input
				.on('focus', function () {

					$filter.addClass('current');
				})
				.on('blur keyup', update);

			$(document)
				.on('keydown', function (event) {

					if (event.which === 27) {
						$input.attr('value','').blur();
					}
				})
				.on('keypress', function (event) {

					$input.focus();
				});
		};

	init();
});
