
modulejs.define('core/store', ['_'], function (_) {

	var store = window.localStorage,

		put = function (key, value) {

			if (store && _.isString(key)) {
				store[key] = JSON.stringify({data: value});
			}
		},

		get = function (key) {

			if (store && _.isString(key)) {
				var json = store[key],
					obj = {};

				try { obj = JSON.parse(json); } catch (e) {}

				return obj.data;
			}
		};

	return {
		put: put,
		get: get
	};
});
