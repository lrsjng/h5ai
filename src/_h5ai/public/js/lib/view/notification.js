const {dom} = require('../util');
const base = require('./base');

const init = () => {
    const $el = dom('<div id="notification"></div>').hide().appTo(base.$root);

    const set = content => {
        if (content) {
            $el.html(content).show();
        } else {
            $el.hide();
        }
    };

    return {
        set
    };
};

module.exports = init();
