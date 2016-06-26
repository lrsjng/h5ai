const {isNum} = require('../util');

const decimalMetric = {
    t: 1000.0,
    k: 1000.0,
    u: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
};
const binaryMetric = {
    t: 1024.0,
    k: 1024.0,
    u: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
};
let defaultMetric = decimalMetric;

const datePatterns = [
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
let defaultDateFormat = 'YYYY-MM-DD HH:mm';


const setDefaultMetric = useBinaryMetric => {
    defaultMetric = useBinaryMetric ? binaryMetric : decimalMetric;
};

const formatSize = (size, metric) => {
    metric = metric || defaultMetric;

    if (!isNum(size) || size < 0) {
        return '';
    }

    let i = 0;
    const maxI = metric.u.length - 1;

    while (size >= metric.t && i < maxI) {
        size /= metric.k;
        i += 1;
    }
    return (i <= 1 ? Math.round(size) : size.toFixed(1)).toString() + ' ' + metric.u[i];
};

const setDefaultDateFormat = dateFormat => {
    defaultDateFormat = dateFormat;
};

const formatNumber = (number, padding) => {
    let str = String(number);
    if (padding) {
        str = ('000' + str).substr(-padding);
    }
    return str;
};

const formatDate = (millis, format) => {
    if (!millis || !isNum(millis)) {
        return '';
    }

    format = format || defaultDateFormat;

    const date = new Date(millis);
    const d = {
        Y: date.getFullYear(),
        M: date.getMonth() + 1,
        D: date.getDate(),
        H: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
    };

    datePatterns.forEach(pattern => {
        format = format.replace(pattern[0], formatNumber(d[pattern[1]], pattern[2]));
    });

    return format;
};


module.exports = {
    setDefaultMetric,
    formatSize,
    setDefaultDateFormat,
    formatDate
};
