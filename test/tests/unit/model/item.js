(function () {
'use strict';

var ID = 'model/item';
var DEPS = ['_', 'core/event', 'core/location', 'core/server', 'core/settings', 'core/types'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xTypes = util.uniqObj();
        this.xEvent = util.uniqObj();
        this.xSettings = util.uniqObj();
        this.xServer = util.uniqObj();
        this.xLocation = util.uniqObj();
        this.applyFn = function () {

            return this.definition.fn(_, this.xEvent, this.xLocation, this.xServer, this.xSettings, this.xTypes);
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

    describe('.get()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.get);
        });
    });

    describe('.remove()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.remove);
        });
    });
});

}());
