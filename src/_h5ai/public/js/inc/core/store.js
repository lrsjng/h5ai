modulejs.define('core/store', ['modernizr'], function (modernizr) {

    var store = modernizr.localstorage ? window.localStorage : {};
    var storekey = '_h5ai';


    function load() {

        try {
            return JSON.parse(store[storekey]);
        } catch (e) {}
        return {};
    }

    function save(obj) {

        store[storekey] = JSON.stringify(obj);
    }

    function put(key, value) {

        var obj = load();
        obj[key] = value;
        save(obj);
    }

    function get(key) {

        return load()[key];
    }


    return {
        put: put,
        get: get
    };
});
