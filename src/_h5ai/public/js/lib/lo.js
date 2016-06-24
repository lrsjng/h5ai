const tof = (x, str) => typeof x === str;
const isStr = x => tof(x, 'string');
const isFn = x => tof(x, 'function');
const isNum = x => tof(x, 'number');
const keys = obj => {
    if (!obj || isStr(obj)) {
        return [];
    }
    if (obj.hasOwnProperty('length')) {
        obj = Array.from(obj);
    }
    return Object.keys(obj);
};
const values = obj => keys(obj).map(key => obj[key]);
const each = (obj, fn) => keys(obj).forEach(key => fn(obj[key], key));
const filter = (obj, fn) => values(obj).filter(fn);
const map = (obj, fn) => values(obj).map(fn);
const includes = (obj, x) => values(obj).indexOf(x) >= 0;
const difference = (obj1, obj2) => {
    obj2 = values(obj2);
    return filter(obj1, x => obj2.indexOf(x) < 0);
};
const intersection = (obj1, obj2) => {
    obj2 = values(obj2);
    return filter(obj1, x => obj2.indexOf(x) >= 0);
};
const sortBy = (obj, sel) => {
    const selFn = isFn(sel) ? sel : x => x[sel];
    const cmpFn = (x, y) => {
        x = selFn(x);
        y = selFn(y);
        return x < y ? -1 : x > y ? 1 : 0;
    };
    return values(obj).sort(cmpFn);
};

module.exports = {
    isStr,
    isFn,
    isNum,
    keys,
    values,
    each,
    filter,
    map,
    includes,
    difference,
    intersection,
    sortBy
};
