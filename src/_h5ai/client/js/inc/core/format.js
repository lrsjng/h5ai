
modulejs.define('core/format', ['_', 'moment'], function (_, moment) {

	var reParseSize = /^\s*([\.\d]+)\s*([kmgt]?)b?\s*$/i,
		decimalMetric = {
			t: 1000.0,
			k: 1000.0,
			u: ['B', 'KB', 'MB', 'GB', 'TB']
		},
		binaryMetric = {
			t: 1024.0,
			k: 1024.0,
			u: ['B', 'KiB', 'MiB', 'GiB', 'TiB']
		},
		defaultMetric = decimalMetric,
		defaultDateFormat = 'YYYY-MM-DD HH:mm',

		parseSize = function (str) {

			var match = reParseSize.exec(str),
				kilo = decimalMetric.k,
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

		setDefaultMetric = function (metric) {

			if (!metric) {
				defaultMetric = decimalMetric;
			} else if (metric === true) {
				defaultMetric = binaryMetric;
			} else {
				defaultMetric = metric;
			}
		},

		formatSize = function (size, metric) {

			metric = metric || defaultMetric;

			if (!_.isNumber(size) || size < 0) {
				return '';
			}

			var i = 0,
				maxI = metric.u.length - 1;

			while (size >= metric.t && i < maxI) {
				size /= metric.k;
				i += 1;
			}
			return (i <= 1 ? Math.round(size) : size.toFixed(1)).toString() + ' ' + metric.u[i];
		},

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
		setDefaultMetric: setDefaultMetric,
		formatSize: formatSize,
		setDefaultDateFormat: setDefaultDateFormat,
		parseDate: parseDate,
		formatDate: formatDate
	};
});
