const {test} = require('scar');
const {clearModulejs, mockConfigModule} = require('./util/modjs');
const {pinHtml} = require('./util/pin');

mockConfigModule();
clearModulejs();

require('./tests/premisses');
require('./tests/unit/boot');
require('./tests/unit/config');
require('./tests/unit/libs');
require('./tests/unit/modulejs');

pinHtml();

test.cli({sync: true});
