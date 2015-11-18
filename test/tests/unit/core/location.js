(function () {
    var ID = 'core/location';
    var DEPS = ['_', 'core/event', 'core/modernizr', 'core/settings', 'view/notification'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xModernizr = {
                history: true
            };
            this.xSettings = {view: {
                fastBrowsing: true,
                unmanagedInNewWindow: true
            }};
            this.xEvent = {
                pub: sinon.stub(),
                sub: sinon.stub()
            };
            this.xNotification = {
                set: sinon.stub()
            };
            this.applyFn = function () {
                this.xEvent.pub.reset();
                this.xEvent.sub.reset();
                this.xNotification.set.reset();

                return this.definition.fn(_, this.xEvent, this.xModernizr, this.xSettings, this.xNotification);
            };
        });

        after(function () {
            window.onpopstate = null;
        });

        beforeEach(function () {
            window.onpopstate = null;
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

            it('sets window.onpopstate function when history and fastBrowsing', function () {
                this.xModernizr.history = true;
                this.xSettings.view.fastBrowsing = true;

                assert.isNull(window.onpopstate);
                this.applyFn();
                assert.isFunction(window.onpopstate);
            });

            it('sets window.onpopstate to null when not history and fastBrowsing', function () {
                this.xModernizr.history = false;
                this.xSettings.view.fastBrowsing = true;

                assert.isNull(window.onpopstate);
                this.applyFn();
                assert.isNull(window.onpopstate);
            });

            it('sets window.onpopstate to null when history and not fastBrowsing', function () {
                this.xModernizr.history = true;
                this.xSettings.view.fastBrowsing = false;

                assert.isNull(window.onpopstate);
                this.applyFn();
                assert.isNull(window.onpopstate);
            });

            it('sets window.onpopstate to null when not history and not fastBrowsing', function () {
                this.xModernizr.history = false;
                this.xSettings.view.fastBrowsing = false;

                assert.isNull(window.onpopstate);
                this.applyFn();
                assert.isNull(window.onpopstate);
            });
        });

        describe('.forceEncoding()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.forceEncoding);
            });

            _.each([
                ['', ''],
                ['//', '/'],
                ['////', '/'],
                ['//a///b////c//', '/a/b/c/'],
                ['a b', 'a%20b'],
                ['ab ', 'ab%20'],
                [' ab', '%20ab'],
                ['a!b', 'a%21b'],
                ['a#b', 'a%23b'],
                ['a$b', 'a%24b'],
                ['a&b', 'a%26b'],
                ['a\'b', 'a%27b'],
                ['a(b', 'a%28b'],
                ['a)b', 'a%29b'],
                ['a*b', 'a%2Ab'],
                ['a+b', 'a%2Bb'],
                ['a,b', 'a%2Cb'],
                ['a:b', 'a%3Ab'],
                ['a;b', 'a%3Bb'],
                ['a=b', 'a%3Db'],
                ['a?b', 'a%3Fb'],
                ['a@b', 'a%40b'],
                ['a[b', 'a%5Bb'],
                ['a]b', 'a%5Db']
            ], function (data) {
                var arg = data[0];
                var exp = data[1];

                it(arg + ' => ' + exp, function () {
                    var instance = this.applyFn();
                    assert.strictEqual(instance.forceEncoding(arg), exp);
                });
            });
        });

        describe('.getDomain()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.getDomain);
            });

            it('returns document.domain', function () {
                var instance = this.applyFn();
                assert.strictEqual(instance.getDomain(), window.document.domain);
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

            it('sets href correct', function () {
                var $el = $('<a/>');
                var item = {
                    absHref: uniq.id(),
                    isManaged: false,
                    isFolder: sinon.stub().returns(false)
                };

                var setLink = this.applyFn().setLink;
                setLink($el, item);

                assert.strictEqual($el.attr('href'), item.absHref);
            });

            it('sets target=\'_blank\' for unmanaged folders', function () {
                this.xSettings.view.unmanagedInNewWindow = true;

                var $el = $('<a/>');
                var item = {
                    absHref: uniq.id(),
                    isManaged: false,
                    isFolder: sinon.stub().returns(true)
                };

                var setLink = this.applyFn().setLink;
                setLink($el, item);

                assert.strictEqual($el.attr('target'), '_blank');
            });

            it('does not set target=\'_blank\' for managed folders', function () {
                this.xSettings.view.unmanagedInNewWindow = true;

                var $el = $('<a/>');
                var item = {
                    absHref: uniq.id(),
                    isManaged: true,
                    isFolder: sinon.stub().returns(true)
                };

                var setLink = this.applyFn().setLink;
                setLink($el, item);

                assert.isUndefined($el.attr('target'));
            });

            it('does not set target=\'_blank\' for unmanaged folders if disabled', function () {
                this.xSettings.view.unmanagedInNewWindow = false;

                var $el = $('<a/>');
                var item = {
                    absHref: uniq.id(),
                    isManaged: true,
                    isFolder: sinon.stub().returns(true)
                };

                var setLink = this.applyFn().setLink;
                setLink($el, item);

                assert.isUndefined($el.attr('target'));
            });
        });
    });
}());
