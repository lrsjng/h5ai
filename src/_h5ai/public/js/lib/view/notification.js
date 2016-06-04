const {jq} = require('../globals');
const base = require('./base');

const $el = jq('<div id="notification"/>').hide().appendTo(base.$root);

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
