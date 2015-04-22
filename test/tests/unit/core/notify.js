(function () {
'use strict';

var ID = 'core/notify';
var DEPS = ['$'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.applyFn = function () {

            return this.definition.fn($);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
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

        it('returns plain object with 1 property', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOfKeys(instance, 1);
        });

        it('adds HTML', function () {

            this.applyFn();
            assert.lengthOf($('#notify'), 1);
            assert.lengthOf($('#notify:visible'), 0);
            assert.strictEqual($('#notify').text(), '');
        });
    });

    describe('.set()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.ok(_.isFunction(instance.set));
        });

        it('works', function () {

            var instance = this.applyFn();

            instance.set();
            assert.lengthOf($('#notify:visible'), 0);
            assert.strictEqual($('#notify').text(), '');

            instance.set('hello');
            assert.lengthOf($('#notify:visible'), 1);
            assert.strictEqual($('#notify').text(), 'hello');

            instance.set('world');
            assert.lengthOf($('#notify:visible'), 1);
            assert.strictEqual($('#notify').text(), 'world');

            instance.set();
            // assert.lengthOf($('#notify:visible'), 0);
            assert.strictEqual($('#notify').text(), 'world');
        });
    });
});

}());
