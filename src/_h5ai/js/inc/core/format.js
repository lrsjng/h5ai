modulejs.define('core/format', ['_'], function (_) {

    var decimalMetric = {
            t: 1000.0,
            k: 1000.0,
            u: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        };
    var binaryMetric = {
            t: 1024.0,
            k: 1024.0,
            u: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
        };
    var defaultMetric = decimalMetric;
    var datePatterns = [
            [/YYYY/, 'Y', 4],
            [/YY/, 'Y', 2],
            [/Y/, 'Y', 0],
            [/MM/, 'M', 2],
            [/M/, 'M', 0],
            [/DD/, 'D', 2],
            [/D/, 'D', 0],
            [/HH/, 'H', 2],
            [/H/, 'H', 0],
            [/mm/, 'm', 2],
            [/m/, 'm', 0],
            [/ss/, 's', 2],
            [/s/, 's', 0]
        ];
    var defaultDateFormat = 'YYYY-MM-DD HH:mm';


    function setDefaultMetric(useBinaryMetric) {

        defaultMetric = useBinaryMetric ? binaryMetric : decimalMetric;
    }

    function formatSize(size, metric) {

        metric = metric || defaultMetric;

        if (!_.isNumber(size) || size < 0) {
            return '';
        }

        var i = 0;
        var maxI = metric.u.length - 1;

        while (size >= metric.t && i < maxI) {
            size /= metric.k;
            i += 1;
        }
        return (i <= 1 ? Math.round(size) : size.toFixed(1)).toString() + ' ' + metric.u[i];
    }

    function setDefaultDateFormat(dateFormat) {

        defaultDateFormat = dateFormat;
    }

    function formatNumber(number, padding) {

        var str = String(number);
        if (padding) {
            str = ('000' + str).substr(-padding);
        }
        return str;
    }

    function formatDate(millis, format) {

        if (!millis || !_.isNumber(millis)) {
            return '';
        }

        format = format || defaultDateFormat;

        var date = new Date(millis);
        var d = {
                Y: date.getFullYear(),
                M: date.getMonth() + 1,
                D: date.getDate(),
                H: date.getHours(),
                m: date.getMinutes(),
                s: date.getSeconds()
            };

        datePatterns.forEach(function (pattern) {
            format = format.replace(pattern[0], formatNumber(d[pattern[1]], pattern[2]));
        });

        return format;
    }


    return {
        setDefaultMetric: setDefaultMetric,
        formatSize: formatSize,
        setDefaultDateFormat: setDefaultDateFormat,
        formatDate: formatDate
    };
});
