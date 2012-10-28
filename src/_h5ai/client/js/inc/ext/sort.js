
modulejs.define('ext/sort', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/store'], function (_, $, allsettings, resource, event, store) {

	var settings = _.extend({
			enabled: false,
			order: 'na'
		}, allsettings.sort),

		storekey = 'sort.order',

		type = function (item) {

			var $item = $(item);

			if ($item.hasClass('folder-parent')) {
				return 0;
			} else if ($item.hasClass('folder')) {
				return 1;
			}
			return 2;
		},

		cmpFn = function (rev, getVal) {

			return function (item1, item2) {

				var res, val1, val2;

				res = type(item1) - type(item2);
				if (res !== 0) {
					return res;
				}

				val1 = getVal(item1);
				val2 = getVal(item2);
				if (val1 < val2) {
					return rev ? 1 : -1;
				} else if (val1 > val2) {
					return rev ? -1 : 1;
				}
				return 0;
			};
		},

		getName = function (item) {

			return $(item).find('.label').text().toLowerCase();
		},
		getTime = function (item) {

			return $(item).find('.date').data('time');
		},
		getSize = function (item) {

			return $(item).find('.size').data('bytes');
		},

		$all, orders,

		sortBy = function (id) {

			var order = orders[id];

			store.put(storekey, id);

			$all.removeClass('ascending').removeClass('descending');
			order.head.addClass(order.clas);
			var current = $('#items .item');
			var sorted = $('#items .item').sort(order.fn);
			for (var i = 0, l = current.length; i < l; i += 1) {
				if (current[i] !== sorted[i]) {
					sorted.detach().sort(order.fn).appendTo('#items');
					break;
				}
			}
		},

		onContentChanged = function (item) {

			sortBy(store.get(storekey) || settings.order);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $ascending = $('<img src="' + resource.image('ascending') + '" class="sort ascending" alt="ascending" />'),
				$descending = $('<img src="' + resource.image('descending') + '" class="sort descending" alt="descending" />'),
				$header = $('#items li.header'),
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

			event.sub('location.changed', onContentChanged);
			event.sub('location.refreshed', onContentChanged);
		};

	init();
});
