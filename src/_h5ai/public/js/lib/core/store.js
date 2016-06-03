const {win} = require('../globals');

const store = win.localStorage;
const storekey = '_h5ai';


function load() {
    try {
        return JSON.parse(store[storekey]);
    } catch (e) {/* skip */}
    return {};
}

function save(obj) {
    store[storekey] = JSON.stringify(obj);
}

function put(key, value) {
    const obj = load();
    obj[key] = value;
    save(obj);
}

function get(key) {
    return load()[key];
}


module.exports = {
    put,
    get
};
