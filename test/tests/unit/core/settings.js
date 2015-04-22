(function () {
'use strict';

var ID = 'core/settings';
var DEPS = ['_', 'config'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xConfig = {
            options: {
                someOptions: util.uniqObj(),
                otherOptions: util.uniqObj(),
                more: util.uniqObj()
            },
            setup: {
                APP_HREF: util.uniqId(),
                ROOT_HREF: util.uniqId(),
                CURRENT_HREF: util.uniqId()
            }
        };
        this.applyFn = function () {

            return this.definition.fn(_, this.xConfig);
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

        it('returns plain object with properties', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.isAbove(_.keys(instance).length, 0);
        });
    });

    describe('publics', function () {

        it('extended from options', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.someOptions, this.xConfig.options.someOptions);
            assert.strictEqual(instance.otherOptions, this.xConfig.options.otherOptions);
            assert.strictEqual(instance.more, this.xConfig.options.more);
            assert.strictEqual(_.keys(instance).length, _.keys(this.xConfig.options).length + 3);
        });
    });

    describe('.appHref', function () {

        it('set correct', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.appHref, this.xConfig.setup.APP_HREF);
        });
    });

    describe('.rootHref', function () {

        it('set correct', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.rootHref, this.xConfig.setup.ROOT_HREF);
        });
    });

    describe('.currentHref', function () {

        it('set correct', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.currentHref, this.xConfig.setup.CURRENT_HREF);
        });
    });
});

}());
