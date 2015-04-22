(function () {
'use strict';

var ID = 'core/store';
var DEPS = ['modernizr'];

describe('module "' + ID + '"', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.storeKey = '_h5ai';
        this.storeBackup = window.localStorage.getItem(this.storeKey);
        this.xModernizr = {localstorage: true};
        this.applyFn = function () {

            return this.definition.fn(this.xModernizr);
        };
    });

    after(function () {

        if (this.storeBackup) {
            window.localStorage.setItem(this.storeKey, this.storeBackup);
        } else {
            window.localStorage.removeItem(this.storeKey);
        }
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

    describe('publics', function () {

        var key1 = 'test1';
        var value1 = '1234';
        var key2 = 'test2';
        var value2 = '5678';

        it('.put() is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.put);
        });

        it('.get() is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.get);
        });

        it('works', function () {

            var instance = this.applyFn();

            assert.isNull(window.localStorage.getItem(this.storeKey));

            assert.isUndefined(instance.get(key1));
            assert.isNull(window.localStorage.getItem(this.storeKey));

            assert.isUndefined(instance.put(key1, value1));
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{"test1":"1234"}');

            assert.strictEqual(instance.get(key1), value1);
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{"test1":"1234"}');

            assert.isUndefined(instance.put(key1, undefined));
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{}');

            assert.isUndefined(instance.get(key1));
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{}');

            assert.isUndefined(instance.put(key1, value1));
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{"test1":"1234"}');

            assert.isUndefined(instance.put(key2, value2));
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{"test1":"1234","test2":"5678"}');

            assert.isUndefined(instance.put(key1, undefined));
            assert.strictEqual(window.localStorage.getItem(this.storeKey), '{"test2":"5678"}');
        });
    });
});

}());
