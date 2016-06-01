const {test, assert} = require('scar');

test('window is global object', () => {
    assert.equal(typeof window, 'object');
    assert.equal(window, window.window);
});

test('document is global object', () => {
    assert.equal(typeof window.document, 'object');
});

test('jQuery and $ are global functions', () => {
    assert.equal(typeof window.jQuery, 'function');
    assert.equal(window.jQuery.fn.jquery, '2.2.4');
    assert.equal(window.jQuery, window.$);
});

test('_ is global function', () => {
    assert.equal(typeof window._, 'function');
    assert.equal(window._.VERSION, '4.13.1');
});
