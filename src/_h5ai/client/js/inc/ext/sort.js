
modulejs.define('ext/sort', ['_', '$', 'core/settings', 'core/resource', 'core/event', 'core/store'], function (_, $, allsettings, resource, event, store) {

	var settings = _.extend({
			enabled: false,
			column: 0,
			reverse: false,
			ignorecase: true,
			natural: false
		}, allsettings.sort),

		storekey = 'ext/sort',
		template = '<img src="' + resource.image('ascending') + '" class="sort ascending" alt="ascending" />' +
					'<img src="' + resource.image('descending') + '" class="sort descending" alt="descending" />',

		getType = function (item) {

			var $item = $(item);

			if ($item.hasClass('folder-parent')) {
				return 0;
			}
			if ($item.hasClass('folder')) {
				return 1;
			}
			return 2;
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

		columnGetters = {
			0: getName,
			1: getTime,
			2: getSize
		},

		columnClasses = {
			0: 'label',
			1: 'date',
			2: 'size'
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
				x = ('' + val1).replace(sre, ''),
				y = ('' + val2).replace(sre, ''),
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

		cmpFn = function (getValue, reverse, ignorecase, natural) {

			return function (item1, item2) {

				var res, val1, val2;

				res = getType(item1) - getType(item2);
				if (res !== 0) {
					return res;
				}

				val1 = getValue(item1);
				val2 = getValue(item2);

				if (isNaN(val1) || isNaN(val2)) {
					val1 = '' + val1;
					val2 = '' + val2;

					if (ignorecase) {
						val1 = val1.toLowerCase();
						val2 = val2.toLowerCase();
					}
				}

				if (natural) {
					res = naturalCmpFn(val1, val2);
				} else {
					res = val1 < val2 ? -1 : (val1 > val2 ? 1 : 0);
				}

				return reverse ? -res : res;
			};
		},

		sortItems = function (column, reverse) {

			var headers = $('#items li.header a'),
				header = $('#items li.header a.' + columnClasses[column]),

				fn = cmpFn(columnGetters[column], reverse, settings.ignorecase, column === 0 && settings.natural),

				current = $('#items .item'),
				sorted = $('#items .item').sort(fn);

			store.put(storekey, {column: column, reverse: reverse});

			headers.removeClass('ascending descending');
			header.addClass(reverse ? 'descending' : 'ascending');

			for (var i = 0, l = current.length; i < l; i += 1) {
				if (current[i] !== sorted[i]) {
					sorted.detach().sort(fn).appendTo('#items');
					break;
				}
			}
		},

		onContentChanged = function (item) {

			var order = store.get(storekey),
				column = order && order.column || settings.column,
				reverse = order && order.reverse || settings.reverse;

			sortItems(column, reverse);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			$('#items li.header')

				.find('a.label')
					.append(template)
					.click(function (event) {
						sortItems(0, $(this).hasClass('ascending'));
						event.preventDefault();
					})
				.end()

				.find('a.date')
					.prepend(template)
					.click(function (event) {
						sortItems(1, $(this).hasClass('ascending'));
						event.preventDefault();
					})
				.end()

				.find('a.size')
					.prepend(template)
					.click(function (event) {
						sortItems(2, $(this).hasClass('ascending'));
						event.preventDefault();
					})
				.end();

			event.sub('location.changed', onContentChanged);
			event.sub('location.refreshed', onContentChanged);
		};

	init();
});
