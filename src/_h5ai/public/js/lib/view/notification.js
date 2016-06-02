const {jQuery: jq} = require('../win');
const root = require('./root');

const $el = jq('<div id="notification"/>').hide().appendTo(root.$el);

function set(content) {
    if (content) {
        $el.stop(true, true).html(content).fadeIn(400);
    } else {
        $el.stop(true, true).fadeOut(400);
    }
}

module.exports = {
    $el,
    set
};
