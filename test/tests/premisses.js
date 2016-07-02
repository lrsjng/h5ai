const {test, assert} = require('scar');

test('window is global object', () => {
    assert.equal(typeof global, 'object');
    assert.equal(global, global.window);
});

test('document is global object', () => {
    assert.equal(typeof global.document, 'object');
});
