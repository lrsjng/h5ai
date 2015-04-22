(function () {
'use strict';

var ID = 'boot';
var DEPS = ['$'];

describe('module "' + ID + '"', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xConfig = util.uniqObj();
        this.xAjaxResult = {
            done: sinon.stub().callsArgWith(0, this.xConfig),
            fail: sinon.stub().callsArg(0),
            always: sinon.stub().callsArg(0)
        };
        this.xAjax = sinon.stub($, 'ajax').returns(this.xAjaxResult);
        this.xDefine = sinon.stub(modulejs, 'define');
        this.xRequire = sinon.stub(modulejs, 'require');

        this.applyFn = function () {

            this.xAjaxResult.done.reset();
            this.xAjaxResult.fail.reset();
            this.xAjaxResult.always.reset();
            this.xAjax.reset();
            this.xDefine.reset();
            this.xRequire.reset();

            return this.definition.fn($);
        };
    });

    after(function () {

        this.xAjax.restore();
        this.xDefine.restore();
        this.xRequire.restore();
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

        it('returns undefined', function () {

            var instance = this.applyFn();
            assert.isUndefined(instance);
        });

        it('no data-module', function () {

            this.applyFn();
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xDefine.called);
            assert.isFalse(this.xRequire.called);
        });

        it('data-module="test"', function () {

            $('<script/>').attr('data-module', 'test').appendTo('head');
            this.applyFn();
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xDefine.called);
            assert.isFalse(this.xRequire.called);
        });

        it('data-module="info"', function () {

            $('<script/>').attr('data-module', 'info').appendTo('head');

            this.applyFn();

            assert.isTrue(this.xAjax.calledOnce);
            assert.strictEqual(this.xAjax.lastCall.args[0].url, 'server/php/index.php');
            assert.strictEqual(this.xAjax.lastCall.args[0].type, 'POST');
            assert.strictEqual(this.xAjax.lastCall.args[0].dataType, 'json');

            assert.isTrue(this.xAjaxResult.done.calledOnce);
            assert.isFalse(this.xAjaxResult.fail.called);
            assert.isFalse(this.xAjaxResult.always.called);

            assert.isTrue(this.xDefine.calledOnce);
            assert.deepEqual(this.xDefine.lastCall.args, ['config', this.xConfig]);

            assert.isTrue(this.xRequire.calledOnce);
            assert.deepEqual(this.xRequire.lastCall.args, ['main/info']);
        });

        it('data-module="index"', function () {

            $('<script/>').attr('data-module', 'index').appendTo('head');

            this.applyFn();

            assert.isTrue(this.xAjax.calledOnce);
            assert.strictEqual(this.xAjax.lastCall.args[0].url, '.');
            assert.strictEqual(this.xAjax.lastCall.args[0].type, 'POST');
            assert.strictEqual(this.xAjax.lastCall.args[0].dataType, 'json');

            assert.isTrue(this.xAjaxResult.done.calledOnce);
            assert.isFalse(this.xAjaxResult.fail.called);
            assert.isFalse(this.xAjaxResult.always.called);

            assert.isTrue(this.xDefine.calledOnce);
            assert.deepEqual(this.xDefine.lastCall.args, ['config', this.xConfig]);

            assert.isTrue(this.xRequire.calledOnce);
            assert.deepEqual(this.xRequire.lastCall.args, ['main/index']);
        });

        it('"no-browser"-class and no data-module', function () {

            $('html').addClass('no-browser');
            this.applyFn();
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xDefine.called);
            assert.isFalse(this.xRequire.called);
        });

        it('"no-browser"-class and data-module="test"', function () {

            $('html').addClass('no-browser');
            $('<script/>').attr('data-module', 'test').appendTo('head');
            this.applyFn();
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xDefine.called);
            assert.isFalse(this.xRequire.called);
        });

        it('"no-browser"-class and data-module="info"', function () {

            $('html').addClass('no-browser');
            $('<script/>').attr('data-module', 'info').appendTo('head');
            this.applyFn();
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xDefine.called);
            assert.isFalse(this.xRequire.called);
        });

        it('"no-browser"-class and data-module="index"', function () {

            $('html').addClass('no-browser');
            $('<script/>').attr('data-module', 'index').appendTo('head');
            this.applyFn();
            assert.isFalse(this.xAjax.called);
            assert.isFalse(this.xDefine.called);
            assert.isFalse(this.xRequire.called);
        });
    });
});

}());
