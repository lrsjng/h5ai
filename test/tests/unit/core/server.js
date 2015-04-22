(function () {
'use strict';

var ID = 'core/server';
var DEPS = ['_', '$', 'config', 'core/location'];
var $submitSnap;

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xConfig = {
            setup: {
                API: true,
                BACKEND: util.uniqId(),
                SERVER_NAME: util.uniqId(),
                SERVER_VERSION: util.uniqId()
            }
        };
        this.xAbsHref = util.uniqId();
        this.xLocation = {
            getAbsHref: sinon.stub().returns(this.xAbsHref)
        };
        this.xAjaxResult = {
            done: sinon.stub().returnsThis(),
            fail: sinon.stub().returnsThis(),
            always: sinon.stub().returnsThis()
        };
        this.xAjax = sinon.stub($, 'ajax').returns(this.xAjaxResult);
        this.xSubmit = sinon.stub($.fn, 'submit', function () {

            $submitSnap = this;
            return this;
        });

        this.applyFn = function () {

            this.xLocation.getAbsHref.reset();
            this.xAjaxResult.done.reset();
            this.xAjaxResult.fail.reset();
            this.xAjaxResult.always.reset();
            this.xAjax.reset();
            this.xSubmit.reset();
            $submitSnap = undefined;

            return this.definition.fn(_, $, this.xConfig, this.xLocation);
        };
    });

    after(function () {

        this.xAjax.restore();
        this.xSubmit.restore();
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

        it('returns plain object with 6 properties', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOf(_.keys(instance), 6);
        });
    });

    describe('.backend', function () {

        it('set correct', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.backend, this.xConfig.setup.BACKEND);
        });
    });

    describe('.name', function () {

        it('set correct', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.name, this.xConfig.setup.SERVER_NAME);
        });
    });

    describe('.version', function () {

        it('set correct', function () {

            var instance = this.applyFn();
            assert.strictEqual(instance.version, this.xConfig.setup.SERVER_VERSION);
        });
    });

    describe('.api', function () {

        it('set correct (false)', function () {

            this.xConfig.setup.API = false;
            var instance = this.applyFn();
            assert.isFalse(instance.api);
        });

        it('set correct (falsy)', function () {

            this.xConfig.setup.API = null;
            var instance = this.applyFn();
            assert.isFalse(instance.api);
        });

        it('set correct (truthy)', function () {

            this.xConfig.setup.API = 1;
            var instance = this.applyFn();
            assert.isFalse(instance.api);
        });

        it('set correct (true)', function () {

            this.xConfig.setup.API = true;
            var instance = this.applyFn();
            assert.isTrue(instance.api);
        });
    });

    describe('.request()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.request);
        });

        it('no result if no API', function () {

            this.xConfig.setup.API = false;

            var instance = this.applyFn();

            var xData = util.uniqObj();
            var spy = sinon.spy();
            var res = instance.request(xData, spy);

            assert.isUndefined(res);
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xAjaxResult.done.called);
            assert.isFalse(this.xAjaxResult.fail.called);
            assert.isFalse(this.xAjax.called);
            assert.isTrue(spy.calledOnce);
            assert.deepEqual(spy.lastCall.args, []);
        });

        it('done() works', function () {

            this.xConfig.setup.API = true;

            var instance = this.applyFn();

            var xData = util.uniqObj();
            var xResult = util.uniqObj();
            var spy = sinon.spy();
            var res = instance.request(xData, spy);

            assert.isUndefined(res);
            assert.isTrue(this.xLocation.getAbsHref.calledOnce);
            assert.isTrue(this.xAjax.calledOnce);
            assert.deepEqual(this.xAjax.lastCall.args, [{
                url: this.xAbsHref,
                data: xData,
                type: 'POST',
                dataType: 'json'
            }]);
            assert.isTrue(this.xAjaxResult.done.calledOnce);
            assert.isTrue(this.xAjaxResult.fail.calledOnce);
            assert.isFalse(spy.called);

            this.xAjaxResult.done.callArgWith(0, xResult);

            assert.isTrue(spy.calledOnce);
            assert.deepEqual(spy.firstCall.args, [xResult]);
        });

        it('fail() works', function () {

            this.xConfig.setup.API = true;

            var instance = this.applyFn();

            var xData = util.uniqObj();
            var spy = sinon.spy();
            var res = instance.request(xData, spy);

            assert.isUndefined(res);
            assert.isTrue(this.xLocation.getAbsHref.calledOnce);
            assert.isTrue(this.xAjax.calledOnce);
            assert.deepEqual(this.xAjax.lastCall.args, [{
                url: this.xAbsHref,
                data: xData,
                type: 'POST',
                dataType: 'json'
            }]);
            assert.isTrue(this.xAjaxResult.done.calledOnce);
            assert.isTrue(this.xAjaxResult.fail.calledOnce);
            assert.isFalse(spy.called);

            this.xAjaxResult.fail.callArg(0);

            assert.isTrue(spy.calledOnce);
            assert.deepEqual(spy.firstCall.args, []);
        });
    });

    describe('.formRequest()', function () {

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.formRequest);
        });

        it('does nothing if no API', function () {

            this.xConfig.setup.API = false;

            var instance = this.applyFn();

            var xData = util.uniqObj();
            var res = instance.formRequest(xData);

            assert.isUndefined(res);

            assert.isFalse(this.xSubmit.called);
            assert.isUndefined($submitSnap);
        });

        it('works', function () {

            this.xConfig.setup.API = true;

            var instance = this.applyFn();

            var xData = {
                a: util.uniqId(),
                b: util.uniqId()
            };
            var res = instance.formRequest(xData);

            assert.isUndefined(res);

            assert.isTrue(this.xSubmit.calledOnce);

            assert.lengthOf($submitSnap, 1);
            assert.strictEqual($submitSnap.get(0).tagName.toLowerCase(), 'form');
            assert.strictEqual($submitSnap.attr('method'), 'post');
            assert.strictEqual($submitSnap.attr('style'), 'display:none;');
            assert.strictEqual($submitSnap.attr('action'), this.xAbsHref);

            var $children = $submitSnap.children();

            assert.lengthOf($children, 2);

            assert.strictEqual($children.eq(0).attr('type'), 'hidden');
            assert.strictEqual($children.eq(0).attr('name'), 'a');
            assert.strictEqual($children.eq(0).attr('value'), xData.a);

            assert.strictEqual($children.eq(1).attr('type'), 'hidden');
            assert.strictEqual($children.eq(1).attr('name'), 'b');
            assert.strictEqual($children.eq(1).attr('value'), xData.b);
        });
    });
});

}());
