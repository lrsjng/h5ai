
modulejs.define('core/event', ['_'], function (_) {

	var slice = Array.prototype.slice,
		subscriptions = {},

		sub = function (topic, callback) {

			if (_.isString(topic) && _.isFunction(callback)) {

				if (!subscriptions[topic]) {
					subscriptions[topic] = [];
				}
				subscriptions[topic].push(callback);
			}
		},

		unsub = function (topic, callback) {

			if (_.isString(topic) && _.isFunction(callback) && subscriptions[topic]) {

				subscriptions[topic] = _.without(subscriptions[topic], callback);
			}
		},

		pub = function (topic, data) {

			var args = slice.call(arguments, 1);

			// console.log('EVENT PUB', topic, args);
			if (_.isString(topic) && subscriptions[topic]) {

				_.each(subscriptions[topic], function (callback) {

					callback.apply(topic, args);
				});
			}
		};

	return {
		sub: sub,
		unsub: unsub,
		pub: pub
	};
});
