const {test, assert} = require('scar');
const format = require('../../../../src/_h5ai/public/js/lib/core/format');

test('format is object', () => {
    assert.equal(typeof format, 'object');
});

test('format has the right props', () => {
    assert.deepEqual(Object.keys(format), ['setDefaultMetric', 'formatSize', 'setDefaultDateFormat', 'formatDate']);
});

test('format.setDefaultMetric is function', () => {
    assert.equal(typeof format.setDefaultMetric, 'function');
});

test('format.formatSize is function', () => {
    assert.equal(typeof format.formatSize, 'function');
});

test('format.setDefaultDateFormat is function', () => {
    assert.equal(typeof format.setDefaultDateFormat, 'function');
});

test('format.formatDate is function', () => {
    assert.equal(typeof format.formatDate, 'function');
});
