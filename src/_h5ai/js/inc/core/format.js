
modulejs.define('core/format', ['moment'], function (moment) {

	var reParseSize = /^\s*([\.\d]+)\s*([kmgt]?)b?\s*$/i,
		treshhold = 1000.0,
		kilo = 1000.0,
		sizeUnits = ['B', 'KB', 'MB', 'GB', 'TB'],

		parseSize = function (str) {

			var match = reParseSize.exec(str),
				val, unit;

			if (!match) {
				return null;
			}

			val = parseFloat(match[1]);
			unit = match[2].toLowerCase();
			if (unit === 'k') {
				val *= kilo;
			} else if (unit === 'm') {
				val *= kilo * kilo;
			} else if (unit === 'g') {
				val *= kilo * kilo * kilo;
			} else if (unit === 't') {
				val *= kilo * kilo * kilo * kilo;
			}
			return val;
		},

		formatSize = function (size) {

			if (!_.isNumber(size) || size < 0) {
				return '';
			}

			var i = 0,
				maxI = sizeUnits.length - 1;

			while (size >= treshhold && i < maxI) {
				size /= kilo;
				i += 1;
			}
			return (i <= 1 ? Math.round(size) : size.toFixed(1)).toString() + ' ' + sizeUnits[i];
		},

		defaultDateFormat = 'YYYY-MM-DD HH:mm',

		setDefaultDateFormat = function (dateFormat) {

			defaultDateFormat = dateFormat;
		},

		parseDate = function (str, dateFormat) {

			try { // problems with ie < 9 :(
				return moment(str, dateFormat || defaultDateFormat).valueOf() || null;
			} catch (err) {}

			return Date.parse(str).valueOf() || null;
		},

		formatDate = function (millis, dateFormat) {

			if (!_.isNumber(millis) || !millis) {
				return '';
			}

			return moment(millis).format(dateFormat || defaultDateFormat);
		};

	return {
		parseSize: parseSize,
		formatSize: formatSize,
		setDefaultDateFormat: setDefaultDateFormat,
		parseDate: parseDate,
		formatDate: formatDate
	};
});
