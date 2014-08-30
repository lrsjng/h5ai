modulejs.define('core/store', ['modernizr'], function (modernizr) {

    var store = modernizr.localstorage ? window.localStorage : null;
    var key = '_h5ai';


    function load() {

        if (store) {
            try {
                return JSON.parse(store[key]);
            } catch (e) {}
        }
        return {};
    }

    function save(obj) {

        if (store) {
            store[key] = JSON.stringify(obj);
        }
    }

    function put(key, value) {

        var obj = load();
        obj[key] = value;
        return save(obj);
    }

    function get(key) {

        return load()[key];
    }


    return {
        put: put,
        get: get
    };
});
