(function () {
    var ID = 'core/server';
    var DEPS = ['_', '$'];
    var $submitEl;

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xAjaxResult = {
                done: sinon.stub().returnsThis(),
                fail: sinon.stub().returnsThis(),
                always: sinon.stub().returnsThis()
            };
            this.xAjax = sinon.stub($, 'ajax').returns(this.xAjaxResult);
            this.xSubmit = sinon.stub($.fn, 'submit', function () {
                $submitEl = this;
                return this;
            });

            this.applyFn = function () {
                this.xAjaxResult.done.reset();
                this.xAjaxResult.fail.reset();
                this.xAjaxResult.always.reset();
                this.xAjax.reset();
                this.xSubmit.reset();
                $submitEl = undefined;

                return this.definition.fn(_, $);
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
            it('returns plain object with 2 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 2);
            });
        });

        describe('.request()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.request);
            });

            it('done() works', function () {
                var instance = this.applyFn();

                var xData = uniq.obj();
                var xResult = uniq.obj();
                var spy = sinon.spy();
                var res = instance.request(xData, spy);

                assert.isUndefined(res);
                assert.isTrue(this.xAjax.calledOnce);
                assert.deepEqual(this.xAjax.lastCall.args, [{
                    url: '?',
                    data: xData,
                    type: 'post',
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
                var instance = this.applyFn();

                var xData = uniq.obj();
                var spy = sinon.spy();
                var res = instance.request(xData, spy);

                assert.isUndefined(res);
                assert.isTrue(this.xAjax.calledOnce);
                assert.deepEqual(this.xAjax.lastCall.args, [{
                    url: '?',
                    data: xData,
                    type: 'post',
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

            it('works', function () {
                var instance = this.applyFn();

                var xData = {
                    a: uniq.id(),
                    b: uniq.id()
                };
                var res = instance.formRequest(xData);

                assert.isUndefined(res);

                assert.isTrue(this.xSubmit.calledOnce);

                assert.lengthOf($submitEl, 1);
                assert.strictEqual($submitEl.get(0).tagName.toLowerCase(), 'form');
                assert.strictEqual($submitEl.attr('method'), 'post');
                assert.strictEqual($submitEl.attr('style').replace(/\s+/g, ''), 'display:none;');
                assert.strictEqual($submitEl.attr('action'), '?');

                var $children = $submitEl.children();

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
