(function () {
'use strict';

describe('premisses', function () {

    it('window is global object', function () {

        assert.isObject(window);
        assert.strictEqual(window, window.window);
    });

    it('jQuery and $ are global objects', function () {

        assert.isFunction(jQuery);
        assert.strictEqual(jQuery, window.jQuery);
        assert.strictEqual(jQuery.fn.jquery, '2.1.3');

        assert.strictEqual($, jQuery);
        assert.strictEqual($, window.$);
    });

    it('_ is global object', function () {

        assert.isFunction(_);
        assert.strictEqual(_, window._);
        assert.strictEqual(_.VERSION, '3.6.0');
    });

    it('util is global object', function () {

        assert.isPlainObject(util);
        assert.strictEqual(util, window.util);
    });

    it('util.uniqId() works', function () {

        assert.isFunction(util.uniqId);

        var uid1 = parseInt(util.uniqId().replace(/\D/g, ''), 10);

        assert.isTrue(util.isUniqId(util.uniqId()));
        assert.notEqual(util.uniqId(), util.uniqId());
        assert.notDeepEqual(util.uniqId(), util.uniqId());
        assert.notStrictEqual(util.uniqId(), util.uniqId());

        var uid2 = parseInt(util.uniqId().replace(/\D/g, ''), 10);
        assert.strictEqual(uid2, uid1 + 8);
    });

    it('util.uniqObj() works', function () {

        assert.isFunction(util.uniqId);

        assert.lengthOfKeys(util.uniqObj(), 1);
        assert.isTrue(util.isUniqId(util.uniqObj().uniqId));
        assert.notEqual(util.uniqObj(), util.uniqObj());
        assert.notDeepEqual(util.uniqObj(), util.uniqObj());
        assert.notStrictEqual(util.uniqObj(), util.uniqObj());
        assert.notEqual(util.uniqObj().uniqId, util.uniqObj().uniqId);
        assert.notDeepEqual(util.uniqObj().uniqId, util.uniqObj().uniqId);
        assert.notStrictEqual(util.uniqObj().uniqId, util.uniqObj().uniqId);
    });

    it('util.uniqPath() works', function () {

        assert.isFunction(util.uniqPath);

        assert.notEqual(util.uniqPath(), util.uniqPath());
        assert.notDeepEqual(util.uniqPath(), util.uniqPath());
        assert.notStrictEqual(util.uniqPath(), util.uniqPath());
        assert.strictEqual(util.uniqPath('abc').substr(-3), 'abc');
        assert.strictEqual(util.uniqPath('xyz/').substr(-4), 'xyz/');
    });

    it('assert.isPlainObject() works', function () {

        assert.isFunction(assert.isPlainObject);

        assert.isPlainObject({});
        assert.isPlainObject({a: 1});
        assert.isPlainObject(Object());
        assert.isPlainObject(new Object());

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
