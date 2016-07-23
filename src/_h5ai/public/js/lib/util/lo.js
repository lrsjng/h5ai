const is = x => x !== undefined && x !== null;
const tof = (x, str) => typeof x === str;
const isStr = x => tof(x, 'string');
const isFn = x => tof(x, 'function');
const isNum = x => tof(x, 'number');
const hasLength = x => x && x.hasOwnProperty('length');
const keys = obj => {
    if (!obj || isStr(obj)) {
        return [];
    }
    if (hasLength(obj)) {
        obj = Array.from(obj);
    }
    return Object.keys(obj);
};
const values = obj => keys(obj).map(key => obj[key]);
const each = (obj, fn) => keys(obj).forEach(key => fn(obj[key], key));
const filter = (obj, fn) => values(obj).filter(fn);
const map = (obj, fn) => values(obj).map(fn);
const includes = (obj, x) => values(obj).indexOf(x) >= 0;
const compact = obj => filter(obj, x => !!x);

const isInstanceOf = (x, constructor) => x ? x instanceof constructor : false;
const toArray = x => Array.from(x);

const difference = (obj1, obj2) => {
    obj2 = values(obj2);
    return filter(obj1, x => obj2.indexOf(x) < 0);
};
const intersection = (obj1, obj2) => {
    obj2 = values(obj2);
    return filter(obj1, x => obj2.indexOf(x) >= 0);
};
const cmp = (x, y) => x < y ? -1 : x > y ? 1 : 0;
const sortBy = (obj, sel) => {
    const selFn = isFn(sel) ? sel : x => x[sel];
    const cmpFn = (x, y) => cmp(selFn(x), selFn(y));
    return values(obj).sort(cmpFn);
};
const debounce = (fn, delay) => {
    let id = null;
    return () => {
        clearTimeout(id);
        id = setTimeout(fn, delay);
    };
};

module.exports = {
    is,
    isStr,
    isFn,
    isNum,
    hasLength,
    keys,
    values,
    each,
    filter,
    map,
    includes,
    compact,
    isInstanceOf,
    toArray,
    difference,
    intersection,
    cmp,
    sortBy,
    debounce
};
