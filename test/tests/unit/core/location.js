(function () {
'use strict';

var ID = 'core/location';
var DEPS = ['_', 'modernizr', 'core/event', 'core/notify', 'core/settings'];

describe('module "' + ID + '"', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xModernizr = {
            history: true
        };
        this.xSettings = {
            smartBrowsing: true,
            unmanagedInNewWindow: true
        };
        this.xEvent = {
            pub: sinon.stub(),
            sub: sinon.stub()
        };
        this.xNotify = {
            set: sinon.stub()
        };
        this.applyFn = function () {

            return this.definition.fn(_, this.xModernizr, this.xEvent, this.xNotify, this.xSettings);
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

        it('returns plain object with 7 properties', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOfKeys(instance, 7);
        });
    });

    describe('publics', function () {

        describe('.forceEncoding()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.forceEncoding);
            });
        });

        describe('.getDomain()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.getDomain);
            });

            it('returns document.domain', function () {

                var instance = this.applyFn();
                assert.strictEqual(instance.getDomain(), document.domain);
            });
        });

        describe('.getAbsHref()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.getAbsHref);
            });

            it('returns null before .setLocation()', function () {

                var instance = this.applyFn();
                assert.isNull(instance.getAbsHref());
            });
        });

        describe('.getItem()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.getItem);
            });
        });

        describe('.setLocation()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.setLocation);
            });
        });

        describe('.refresh()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.refresh);
            });
        });

        describe('.setLink()', function () {

            it('is function', function () {

                var instance = this.applyFn();
                assert.isFunction(instance.setLink);
            });
        });
    });
});

}());
