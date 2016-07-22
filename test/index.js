if (!global.window) {
    global.window = require('jsdom').jsdom().defaultView;
}

const {test} = require('scar');
const {pinHtml} = require('./util/pin');

require('./tests/premisses');
require('./tests/unit/core/event');
require('./tests/unit/core/format');

pinHtml();

test.cli({sync: true});
