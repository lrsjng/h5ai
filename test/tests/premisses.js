(function () {
    describe('premisses', function () {
        it('window is global object', function () {
            assert.isObject(window);
            assert.strictEqual(window, window.window);
        });

        it('document is global object', function () {
            assert.isObject(document);
            assert.strictEqual(document, window.document);
        });

        it('jQuery and $ are global functions', function () {
            assert.isFunction(jQuery);
            assert.strictEqual(jQuery, window.jQuery);
            assert.strictEqual(jQuery.fn.jquery, '2.1.3');

            assert.strictEqual($, jQuery);
            assert.strictEqual($, window.$);
        });

        it('_ is global function', function () {
            assert.isFunction(_);
            assert.strictEqual(_, window._);
            assert.strictEqual(_.VERSION, '3.9.3');
        });

        it('util is global object', function () {
            assert.isPlainObject(util);
            assert.strictEqual(util, window.util);
        });

        it('uniq is global object', function () {
            assert.isPlainObject(uniq);
            assert.strictEqual(uniq, window.uniq);
        });

        it('assert.isPlainObject() works', function () {
            assert.isFunction(assert.isPlainObject);

            assert.isPlainObject({});
            assert.isPlainObject({a: 1});
            assert.isPlainObject(Object());
            assert.isPlainObject(new Object()); // eslint-disable-line no-new-object

            assert.throws(function () { assert.isPlainObject(); });
            assert.throws(function () { assert.isPlainObject(1); });
            assert.throws(function () { assert.isPlainObject('a'); });
            assert.throws(function () { assert.isPlainObject(new Date()); });
            assert.throws(function () { assert.isPlainObject(/a/); });
            assert.throws(function () { assert.isPlainObject(function () {}); });
            assert.throws(function () { assert.isPlainObject(new function A() {}); });
        });

        it('assert.lengthOfKeys() works', function () {
            assert.isFunction(assert.lengthOfKeys);

            assert.lengthOfKeys({}, 0);
            assert.lengthOfKeys({a: true}, 1);
            assert.lengthOfKeys({a: true, b: 0, c: undefined}, 3);

            assert.throws(function () { assert.lengthOfKeys(); });
            assert.throws(function () { assert.lengthOfKeys(1); });
            assert.throws(function () { assert.lengthOfKeys('a'); });
            assert.throws(function () { assert.lengthOfKeys({}); });
            assert.throws(function () { assert.lengthOfKeys({}, 1); });
        });
    });
}());
