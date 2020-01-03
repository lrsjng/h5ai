if (!global.window) {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
}

const {test} = require('scar');
const {pin_html} = require('./util/pin');

require('./tests/premisses');
require('./tests/unit/core/event');
require('./tests/unit/core/format');
require('./tests/unit/util/naturalCmp');
require('./tests/unit/util/parsePatten');

pin_html();

test.cli({sync: true});
