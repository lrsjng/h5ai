
modulejs.define('core/format', ['_', 'moment'], function (_, moment) {

	var decimalMetric = {
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

		formatDate = function (millis, dateFormat) {

			if (!_.isNumber(millis) || !millis) {
				return '';
			}

			return moment(millis).format(dateFormat || defaultDateFormat);
		};

	return {
		setDefaultMetric: setDefaultMetric,
		formatSize: formatSize,
		setDefaultDateFormat: setDefaultDateFormat,
		formatDate: formatDate
	};
});
