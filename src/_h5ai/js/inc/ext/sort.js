
modulejs.define('ext/sort', ['jQuery', 'core/settings', 'core/resource', 'core/store'], function ($, allsettings, resource, store) {

	var defaults = {
			enabled: false,
			order: 'na'
		},

		settings = _.extend({}, defaults, allsettings.sort),

		storekey = 'h5ai.sortorder',

		type = function (entry) {

			var $entry = $(entry);

			if ($entry.hasClass('folder-parent')) {
				return 0;
			} else if ($entry.hasClass('folder')) {
				return 1;
			}
			return 2;
		},

		cmpFn = function (rev, getVal) {

			return function (entry1, entry2) {

				var res, val1, val2;

				res = type(entry1) - type(entry2);
				if (res !== 0) {
					return res;
				}

				val1 = getVal(entry1);
				val2 = getVal(entry2);
				if (val1 < val2) {
					return rev ? 1 : -1;
				} else if (val1 > val2) {
					return rev ? -1 : 1;
				}
				return 0;
			};
		},

		getName = function (entry) {

			return $(entry).find('.label').text().toLowerCase();
		},
		getTime = function (entry) {

			return $(entry).find('.date').data('time');
		},
		getSize = function (entry) {

			return $(entry).find('.size').data('bytes');
		},

		$all, orders,

		sortBy = function (id) {

			var order = orders[id];

			store.put(storekey, id);

			$all.removeClass('ascending').removeClass('descending');
			order.head.addClass(order.clas);
			$('#extended .entry').detach().sort(order.fn).appendTo('#extended > ul');
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $ascending = $('<img src="' + resource.image('ascending') + '" class="sort ascending" alt="ascending" />'),
				$descending = $('<img src="' + resource.image('descending') + '" class="sort descending" alt="descending" />'),
				$header = $('#extended li.header'),
				$label = $header.find('a.label'),
				$date = $header.find('a.date'),
				$size = $header.find('a.size');

			$all = $header.find('a.label,a.date,a.size');
			orders = {
				na: {
					head: $label,
					clas: 'ascending',
					fn: cmpFn(false, getName)
				},
				nd: {
					head: $label,
					clas: 'descending',
					fn: cmpFn(true, getName)
				},
				da: {
					head: $date,
					clas: 'ascending',
					fn: cmpFn(false, getTime)
				},
				dd: {
					head: $date,
					clas: 'descending',
					fn: cmpFn(true, getTime)
				},
				sa: {
					head: $size,
					clas: 'ascending',
					fn: cmpFn(false, getSize)
				},
				sd: {
					head: $size,
					clas: 'descending',
					fn: cmpFn(true, getSize)
				}
			};

			sortBy(store.get(storekey) || settings.order);

			$label
				.append($ascending.clone()).append($descending.clone())
				.click(function (event) {
					sortBy('n' + ($label.hasClass('ascending') ? 'd' : 'a'));
					event.preventDefault();
				});

			$date
				.prepend($ascending.clone()).prepend($descending.clone())
				.click(function (event) {
					sortBy('d' + ($date.hasClass('ascending') ? 'd' : 'a'));
					event.preventDefault();
				});

			$size
				.prepend($ascending.clone()).prepend($descending.clone())
				.click(function (event) {
					sortBy('s' + ($size.hasClass('ascending') ? 'd' : 'a'));
					event.preventDefault();
				});
		};

	init();
});
