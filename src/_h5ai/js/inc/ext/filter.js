
modulejs.define('ext/filter', ['_', '$', 'core/settings', 'core/resource'], function (_, $, allsettings, resource) {

	var defaults = {
			enabled: false
		},

		settings = _.extend({}, defaults, allsettings.filter),

		template = '<li id="filter">' +
						'<span class="element">' +
							'<img src="' + resource.image('filter') + '" alt="filter" />' +
							'<input type="text" value="" placeholder="filter" />' +
						'</span>' +
					'</li>',
		noMatchTemplate = '<div class="no-match l10n-noMatch">no match</div>',

		$filter, $input, $noMatch,

		filter = function (re) {

			var match = [],
				noMatch = [],
				duration = 200;

			if (re) {
				$('#extended .entry').each(function () {

					var label = $(this).find('.label').text();

					if (label.match(re)) {
						match.push(this);
					} else {
						noMatch.push(this);
					}
				});
			} else {
				match = $('#extended .entry');
			}

			if ($(match).length) {
				$noMatch.hide();
			} else {
				setTimeout(function () { $noMatch.show(); }, duration);
			}
			$(match).fadeIn(duration);
			$(noMatch).fadeOut(duration);
		},

		checkState = function (focus) {

			var val = $input.val();

			if (val || focus) {
				$filter.addClass('current');
			} else {
				$filter.removeClass('current');
			}
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

				// return escapeRegExp(part);
			}).join('|');

			return new RegExp(sequence, 'i');
		},

		update = function () {

			var val = $input.val();

			if (val) {
				filter(parseFilterSequence(val));
			} else {
				filter();
			}
			checkState($input.is(':focus'));
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$filter = $(template);
			$input = $filter.find('input');
			$noMatch = $(noMatchTemplate).appendTo('#extended');

			$filter
				.on('click', function () {

					$input.focus();
				})
				.appendTo('#navbar');

			$input
				.on('focus', function () {

					checkState(true);
				})
				.on('blur', function () {

					checkState(false);
				})
				.on('keyup', update);
		};

	init();
});
