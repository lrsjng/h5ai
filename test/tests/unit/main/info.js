(function () {
'use strict';

var ID = 'main/info';
var DEPS = ['$', 'config'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xConfig = {
            setup: {
                VERSION: util.uniqId()
            }
        };
        this.xAjaxResult = {
            done: sinon.stub(),
            fail: sinon.stub(),
            always: sinon.stub()
        };
        this.xAjax = sinon.stub($, 'ajax').returns(this.xAjaxResult);

        this.applyFn = function () {

            this.xAjaxResult.done.reset();
            this.xAjaxResult.fail.reset();
            this.xAjaxResult.always.reset();
            this.xAjax.reset();

            return this.definition.fn($, this.xConfig);
        };
    });

    after(function () {

        this.xAjax.restore();
        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        $('<div id="content"/>').appendTo('body');
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

        it('adds HTML #login-wrapper', function () {

            this.applyFn();
            assert.lengthOf($('#content > #login-wrapper'), 1);
        });

        describe('no admin', function () {

            it('adds HTML #pass', function () {

                this.xConfig.setup.AS_ADMIN = false;
                this.applyFn();
                assert.lengthOf($('#login-wrapper > #pass'), 1);
            });

            it('sets #pass val to empty string', function () {

                this.xConfig.setup.AS_ADMIN = false;
                this.applyFn();
                assert.strictEqual($('#login-wrapper > #pass').val(), '');
            });

            it('adds HTML #login', function () {

                this.xConfig.setup.AS_ADMIN = false;
                this.applyFn();
                assert.lengthOf($('#login-wrapper > #login'), 1);
            });

            it('does not add HTML #logout', function () {

                this.xConfig.setup.AS_ADMIN = false;
                this.applyFn();
                assert.lengthOf($('#login-wrapper > #logout'), 0);
            });

            it('does not add HTML #tests', function () {

                this.xConfig.setup.AS_ADMIN = false;
                this.applyFn();
                assert.lengthOf($('#content > #tests'), 0);
            });

            it('login works', function () {

                var pass = util.uniqId();
                this.xConfig.setup.AS_ADMIN = false;
                this.applyFn();
                $('#pass').val(pass);
                $('#login').trigger('click');
                assert.isTrue(this.xAjax.calledOnce);
                assert.deepEqual(this.xAjax.lastCall.args, [{
                    url: 'server/php/index.php',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        action: 'login',
                        pass: pass
                    }
                }]);
            });
        });

        describe('as admin', function () {

            it('does not add HTML #pass', function () {

                this.xConfig.setup.AS_ADMIN = true;
                this.applyFn();
                assert.lengthOf($('#login-wrapper > #pass'), 0);
            });

            it('does not add #login', function () {

                this.xConfig.setup.AS_ADMIN = true;
                this.applyFn();
                assert.lengthOf($('#login-wrapper > #login'), 0);
            });

            it('adds HTML #logout', function () {

                this.xConfig.setup.AS_ADMIN = true;
                this.applyFn();
                assert.lengthOf($('#login-wrapper > #logout'), 1);
            });

            it('adds HTML #tests', function () {

                this.xConfig.setup.AS_ADMIN = true;
                this.applyFn();
                assert.lengthOf($('#content > #tests'), 1);
            });

            it('adds HTML #test (14x)', function () {

                this.xConfig.setup.AS_ADMIN = true;
                this.applyFn();
                assert.strictEqual($('#tests > .test').length, 14);
            });

            it('logout works', function () {

                this.xConfig.setup.AS_ADMIN = true;
                this.applyFn();
                $('#logout').trigger('click');
                assert.isTrue(this.xAjax.calledOnce);
                assert.deepEqual(this.xAjax.lastCall.args, [{
                    url: 'server/php/index.php',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        action: 'logout'
                    }
                }]);
            });
        });
    });
});

}());
