(function () {
    var assert = window.chai.assert;

    assert.lengthOfKeys = function (val, count, msg) {
        var keyCount = _.keys(val).length;
        assert(keyCount === count, msg ? msg : 'expected ' + val + ' to have ' + count + ' keys, but has ' + keyCount);
    };

    assert.isPlainObject = function (val, msg) {
        assert($.isPlainObject(val), msg ? msg : 'expected ' + val + ' to be a plain Object');
    };
}());
