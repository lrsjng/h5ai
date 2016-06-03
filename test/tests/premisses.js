const {test, assert} = require('scar');

test('window is global object', () => {
    assert.equal(typeof global, 'object');
    assert.equal(global, global.window);
});

test('document is global object', () => {
    assert.equal(typeof global.document, 'object');
});

test('jQuery and $ are global functions', () => {
    assert.equal(typeof global.jQuery, 'function');
    assert.equal(global.jQuery.fn.jquery, '2.2.4');
    assert.equal(global.jQuery, global.$);
});

test('_ is global function', () => {
    assert.equal(typeof global._, 'function');
    assert.equal(global._.VERSION, '4.13.1');
});
