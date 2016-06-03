const {jq} = require('../globals');
const root = require('./root');

const $el = jq('<div id="mainrow"/>').appendTo(root.$el);

module.exports = {
    $el
};
