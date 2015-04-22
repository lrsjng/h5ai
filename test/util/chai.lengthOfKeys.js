(function () {
'use strict';

chai.Assertion.addChainableMethod('lengthOfKeys', function (count) {

    var keyCount = _.keys(this._obj).length;

    this.assert(
        keyCount === count,
        'expected ' + this._obj + ' to have ' + count + ' keys, but has ' + keyCount,
        'expected ' + this._obj + ' not to have ' + count + ' keys, but has ' + keyCount
    );
});

chai.assert.lengthOfKeys = function (val, count, msg) {

    new chai.Assertion(val, msg).to.be.lengthOfKeys(count);
};

}());
