(function () {
'use strict';

var ID = 'core/util';
var DEPS = [];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.applyFn = function () {

            return this.definition.fn();
        };
    });

    describe('definition', function () {

        it('is defined', function () {

            assert.isPlainObject(this.definition);
        });

        it('has correct id', function () {

            assert.strictEqual(this.definition.id, ID);
        });

        it('requires correct', function () {

            assert.deepEqual(this.definition.deps, DEPS);
        });

        it('args for each request', function () {

            assert.strictEqual(this.definition.deps.length, this.definition.fn.length);
        });

        it('has no instance', function () {

            assert.notProperty(modulejs._private.instances, ID);
        });

        it('inits without errors', function () {

            this.applyFn();
        });
    });

    describe('application', function () {

        it('returns plain object with 2 properties', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOfKeys(instance, 2);
        });
    });

    describe('.regularCmpFn()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.regularCmpFn);
        });

        _.each([
            [0, 0, 0],
            [1, 0, 1],
            [1, 2, -1],
            ['a', 'a', 0],
            ['b', 'a', 1],
            ['a', 'b', -1],
            ['a 2', 'a 10', 1]
        ], function (data) {

            var arg1 = data[0];
            var arg2 = data[1];
            var exp = data[2];

            it('.regularCmpFn(\'' + arg1 + '\', \'' + arg2 + '\') => \'' + exp + '\'', function () {

                var instance = this.applyFn();
                assert.strictEqual(instance.regularCmpFn(arg1, arg2), exp);
            });
        });
    });

    describe('.naturalCmpFn()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.naturalCmpFn);
        });

        _.each([
            [0, 0, 0],
            [1, 0, 1],
            [1, 2, -1],
            ['a', 'a', 0],
            ['b', 'a', 1],
            ['a', 'b', -1],
            ['a 2', 'a 10', -1]
        ], function (data) {

            var arg1 = data[0];
            var arg2 = data[1];
            var exp = data[2];

            it('.naturalCmpFn(\'' + arg1 + '\', \'' + arg2 + '\') => \'' + exp + '\'', function () {

                var instance = this.applyFn();
                assert.strictEqual(instance.naturalCmpFn(arg1, arg2), exp);
            });
        });
    });
});

}());
