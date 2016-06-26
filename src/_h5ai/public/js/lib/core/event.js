const {isStr, isFn} = require('../util');

const subscriptions = {};

const sub = (topic, listener) => {
    if (isStr(topic) && isFn(listener)) {
        if (!subscriptions[topic]) {
            subscriptions[topic] = [];
        }
        subscriptions[topic].push(listener);
    }
};

const pub = (topic, ...args) => {
    // console.log(topic, args);
    if (isStr(topic) && subscriptions[topic]) {
        subscriptions[topic].forEach(listener => {
            listener.apply(topic, args);
        });
    }
};

module.exports = {
    sub,
    pub
};
