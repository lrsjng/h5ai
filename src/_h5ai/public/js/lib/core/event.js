const {_: lo} = require('../win');

const subscriptions = {};

function sub(topic, listener) {
    if (lo.isString(topic) && lo.isFunction(listener)) {
        if (!subscriptions[topic]) {
            subscriptions[topic] = [];
        }
        subscriptions[topic].push(listener);
    }
}

function unsub(topic, listener) {
    if (lo.isString(topic) && lo.isFunction(listener) && subscriptions[topic]) {
        subscriptions[topic] = lo.without(subscriptions[topic], listener);
    }
}

function pub(topic, ...args) {
    // console.log(topic, args);
    if (lo.isString(topic) && subscriptions[topic]) {
        lo.each(subscriptions[topic], listener => {
            listener.apply(topic, args);
        });
    }
}

module.exports = {
    sub,
    unsub,
    pub
};
