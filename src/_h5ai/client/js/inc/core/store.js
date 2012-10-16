
modulejs.define('core/store', ['modernizr'], function (modernizr) {

	var store = modernizr.localstorage ? window.localStorage : null,

		key = '_h5ai',

		load = function () {

			if (store) {
				try {
					return JSON.parse(store[key]);
				} catch (e) {}
			}
			return {};
		},

		save = function (obj) {

			if (store) {
				store[key] = JSON.stringify(obj);
			}
		},

		put = function (key, value) {

			var obj = load();
			obj[key] = value;
			return save(obj);
		},

		get = function (key) {

			return load()[key];
		};

	return {
		put: put,
		get: get
	};
});
