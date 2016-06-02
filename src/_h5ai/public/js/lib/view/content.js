const {jQuery: jq} = require('../win');
const mainrow = require('./mainrow');

const $el = jq('<div id="content"/>').appendTo(mainrow.$el);

module.exports = {
    $el
};
