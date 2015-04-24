(function () {
'use strict';

chai.Assertion.addChainableMethod('isPlainObject', function () {

    this.assert(
        $.isPlainObject(this._obj),
        'expected ' + this._obj + ' to be a plain Object',
        'expected ' + this._obj + ' not to be a plain Object'
    );
});

chai.assert.isPlainObject = function (val, msg) {

    new chai.Assertion(val, msg).to.be.isPlainObject();
};

}());
