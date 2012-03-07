
(function ($, h5ai) {

	var type = function (entry) {

			var $entry = $(entry);

			if ($entry.hasClass('folder-parent')) {
				return 0;
			} else if ($entry.hasClass('folder')) {
				return 1;
			}
			return 2;
		},
		cmp = function (entry1, entry2, rev, getVal) {

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
		},
		cmpName = function (entry1, entry2) {

			return cmp(entry1, entry2, false, function (entry) {
				return $(entry).find('.label').text().toLowerCase();
			});
		},
		cmpTime = function (entry1, entry2) {

			return cmp(entry1, entry2, false, function (entry) {
				return $(entry).find('.date').data('time');
			});
		},
		cmpSize = function (entry1, entry2) {

			return cmp(entry1, entry2, false, function (entry) {
				return $(entry).find('.size').data('bytes');
			});
		},
		cmpNameRev = function (entry1, entry2) {

			return cmp(entry1, entry2, true, function (entry) {
				return $(entry).find('.label').text().toLowerCase();
			});
		},
		cmpTimeRev = function (entry1, entry2) {

			return cmp(entry1, entry2, true, function (entry) {
				return $(entry).find('.date').data('time');
			});
		},
		cmpSizeRev = function (entry1, entry2) {

			return cmp(entry1, entry2, true, function (entry) {
				return $(entry).find('.size').data('bytes');
			});
		},
		sort = function (fn) {

			$('#extended .entry').detach().sort(fn).appendTo($('#extended > ul'));
		},
		$all, orders,
		sortBy = function (id) {

			var order = orders[id];

			$all.removeClass('ascending').removeClass('descending');
			order.head.addClass(order.clas);
			sort(order.fn);
			h5ai.core.hash({sort: id});
		},
		init = function () {

			var $ascending = $('<img src="' + h5ai.core.image('ascending') + '" class="sort ascending" alt="ascending" />'),
				$descending = $('<img src="' + h5ai.core.image('descending') + '" class="sort descending" alt="descending" />'),
				initialOrder = h5ai.core.hash('sort'),
				$header = $('#extended li.header'),
				$label = $header.find('a.label'),
				$date = $header.find('a.date'),
				$size = $header.find('a.size');

			$all = $header.find('a.label,a.date,a.size');
			orders = {
				na: {
					head: $label,
					clas: 'ascending',
					fn: cmpName
				},
				nd: {
					head: $label,
					clas: 'descending',
					fn: cmpNameRev
				},
				da: {
					head: $date,
					clas: 'ascending',
					fn: cmpTime
				},
				dd: {
					head: $date,
					clas: 'descending',
					fn: cmpTimeRev
				},
				sa: {
					head: $size,
					clas: 'ascending',
					fn: cmpSize
				},
				sd: {
					head: $size,
					clas: 'descending',
					fn: cmpSizeRev
				}
			};

			sortBy(initialOrder ? initialOrder : h5ai.settings.sortorder);

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

	h5ai.sort = {
		init: init
	};

}(jQuery, h5ai));
