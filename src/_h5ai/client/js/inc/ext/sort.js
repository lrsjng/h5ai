
modulejs.define('ext/sort', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/store'], function (_, $, allsettings, resource, event, store) {

	var settings = _.extend({
			enabled: false,
			order: 'na',
			column: 0,
			reverse: false,
			ignorecase: true,
			natural: true
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

		// Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
		// Author: Jim Palmer (based on chunking idea from Dave Koelle)
		//
		// Modified to make it work with h5ai
		naturalCmpFn = function (val1, val2) {

			var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
				sre = /(^[ ]*|[ ]*$)/g,
				dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
				hre = /^0x[0-9a-f]+$/i,
				ore = /^0/,
				// convert all to strings strip whitespace
				x = ('' + val1).replace(sre, '') || '',
				y = ('' + val2).replace(sre, '') || '',
				// chunk/tokenize
				xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
				yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
				// numeric, hex or date detection
				xD = parseInt(x.match(hre), 10) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
				yD = parseInt(y.match(hre), 10) || xD && y.match(dre) && Date.parse(y) || null,
				oFxNcL, oFyNcL;
			// first try and sort Hex codes or Dates
			if (yD)
				if ( xD < yD ) return -1;
				else if ( xD > yD ) return 1;
			// natural sorting through split numeric strings and default strings
			for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
				// find floats not starting with '0', string or 0 if not defined (Clint Priest)
				oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
				oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
				// handle numeric vs string comparison - number < string - (Kyle Adams)
				if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
				// rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
				else if (typeof oFxNcL !== typeof oFyNcL) {
					oFxNcL += '';
					oFyNcL += '';
				}
				if (oFxNcL < oFyNcL) return -1;
				if (oFxNcL > oFyNcL) return 1;
			}
			return 0;
		},

		cmpFn = function (getVal, reverse, ignorecase, natural) {

			return function (item1, item2) {

				var res, val1, val2;

				res = type(item1) - type(item2);
				if (res !== 0) {
					return res;
				}

				val1 = getVal(item1);
				val2 = getVal(item2);

				if (ignorecase) {
					val1 = val1.toLowerCase();
					val2 = val2.toLowerCase();
				}

				if (natural) {
					res = naturalCmpFn(val1, val2);
				} else {
					res = val1 < val2 ? -1 : (val1 > val2 ? 1 : 0);
				}

				return reverse ? -res : res;
			};
		},

		getName = function (item) {

			return $(item).find('.label').text();
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
				$size = $header.find('a.size'),
				column = settings.column,
				reverse = settings.reverse,
				ignorecase = settings.ignorecase,
				natural = settings.natural;

			$all = $header.find('a.label,a.date,a.size');
			orders = {
				na: {
					head: $label,
					clas: 'ascending',
					fn: cmpFn(getName, false, ignorecase, natural)
				},
				nd: {
					head: $label,
					clas: 'descending',
					fn: cmpFn(getName, true, ignorecase, natural)
				},
				da: {
					head: $date,
					clas: 'ascending',
					fn: cmpFn(getTime, false, ignorecase, natural)
				},
				dd: {
					head: $date,
					clas: 'descending',
					fn: cmpFn(getTime, true, ignorecase, natural)
				},
				sa: {
					head: $size,
					clas: 'ascending',
					fn: cmpFn(getSize, false, ignorecase, natural)
				},
				sd: {
					head: $size,
					clas: 'descending',
					fn: cmpFn(getSize, true, ignorecase, natural)
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
