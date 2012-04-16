
module.define('core/event', [amplify], function (amplify) {

	var sub = function (topic, callback) {

			amplify.subscribe(topic, callback);
		},

		unsub = function (topic, callback) {

			amplify.unsubscribe(topic, callback);
		},

		pub = function (topic, data) {

			// console.log('EVENT PUB', topic, data);
			amplify.publish(topic, data);
		};

	return {
		sub: sub,
		unsub: unsub,
		pub: pub
	};
});
