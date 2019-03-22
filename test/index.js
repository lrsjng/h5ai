if (!global.window) {
    const JSDOM = require('jsdom').JSDOM;
    global.window = new JSDOM('').window;
}

const {test} = require('scar');
const {pinHtml} = require('./util/pin');

require('./tests/premisses');
require('./tests/unit/core/event');
require('./tests/unit/core/format');
require('./tests/unit/util/naturalCmp');
require('./tests/unit/util/parsePatten');

pinHtml();

test.cli({sync: true});
