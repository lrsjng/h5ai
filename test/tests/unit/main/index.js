(function () {
'use strict';

var ID = 'main/index';
var DEPS = ['_', 'core/event'];

describe('module "' + ID + '"', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xEvent = {pub: sinon.stub()};
        this.xDefine = sinon.stub(modulejs, 'define');
        this.xRequire = sinon.stub(modulejs, 'require');

        this.applyFn = function () {

            this.xEvent.pub.reset();
            this.xDefine.reset();
            this.xRequire.reset();
            return this.definition.fn(_, this.xEvent);
        };
    });

    after(function () {

        this.xDefine.restore();
        this.xRequire.restore();
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

        it('returns undefined', function () {

            var instance = this.applyFn();
            assert.isUndefined(instance);
        });

        it('publishes "ready" event', function () {

            this.applyFn();
            assert.isTrue(this.xEvent.pub.calledOnce);
            assert.deepEqual(this.xEvent.pub.firstCall.args, ['ready']);
        });

        it('requires all views and extensions (only)', function () {

            this.applyFn();
            var re = /^(view|ext)\//;
            var self = this;
            var counter = 0;

            _.each(modulejs.state(), function (state, id) {

                if (re.test(id)) {
                    counter += 1;
                    assert.isTrue(self.xRequire.calledWithExactly(id));
                }
            });

            assert.strictEqual(self.xRequire.callCount, counter);
        });

        it('requires views before extensions', function () {

            this.applyFn();
            var foundExtension = false;
            var reView = /^view\//;
            var reExt = /^ext\//;

            _.each(this.xRequire.args, function (args) {

                if (foundExtension) {
                    assert.match(args[0], reExt);
                } else if (reExt.test(args[0])) {
                    foundExtension = true;
                } else {
                    assert.match(args[0], reView);
                }
            });
        });
    });
});

}());
