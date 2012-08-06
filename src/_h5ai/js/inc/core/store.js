
modulejs.define('core/store', ['amplify'], function (amplify) {

	var put = function (key, value) {

			amplify.store(key, value);
		},

		get = function (key) {

			return amplify.store(key);
		};

	return {
		put: put,
		get: get
	};
});
