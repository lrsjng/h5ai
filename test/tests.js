const {test} = require('scar');
const {pinHtml} = require('./util/pin');

require('./tests/premisses');

pinHtml();

test.cli({sync: true});
