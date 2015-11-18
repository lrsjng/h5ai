(function () {
    var ID = 'model/item';
    var DEPS = ['_', 'core/event', 'core/location', 'core/server', 'core/settings', 'core/types'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xRootName = uniq.id();
            this.xTypes = {
                getType: sinon.stub().returns(uniq.id())
            };
            this.xEvent = uniq.obj();
            this.xSettings = {
                rootHref: uniq.path('/' + this.xRootName + '/')
            };
            this.xServer = uniq.obj();
            this.xLocation = {
                forceEncoding: sinon.stub().returnsArg(0),
                getDomain: sinon.stub().returns(uniq.id()),
                getAbsHref: sinon.stub().returns(uniq.id())
            };
            this.applyFn = function () {
                return this.definition.fn(_, this.xEvent, this.xLocation, this.xServer, this.xSettings, this.xTypes);
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
            it('returns plain object with 2 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 2);
            });
        });

        describe('.get()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.get);
            });

            it('returns null with no argument', function () {
                var instance = this.applyFn();
                assert.isNull(instance.get());
            });

            it('returns null for no string argument', function () {
                var instance = this.applyFn();
                assert.isNull(instance.get(1));
            });

            it('returns null for href not starting with rootHref', function () {
                var instance = this.applyFn();
                assert.isNull(instance.get('/a/'));
            });

            describe('for rootHref', function () {
                beforeEach(function () {
                    var instance = this.applyFn();
                    this.item = instance.get(this.xSettings.rootHref);
                });

                it('returns object', function () {
                    assert.isObject(this.item);
                });

                it('sets href correct', function () {
                    assert.strictEqual(this.item.absHref, this.xSettings.rootHref);
                });

                it('sets type correct', function () {
                    assert.strictEqual(this.item.type, this.xTypes.getType(this.absHref));
                });

                it('sets label correct', function () {
                    assert.strictEqual(this.item.label, this.xRootName);
                });

                it('sets time to null', function () {
                    assert.isNull(this.item.time);
                });

                it('sets size to null', function () {
                    assert.isNull(this.item.size);
                });

                it('sets parent to null', function () {
                    assert.isNull(this.item.parent);
                });

                it('sets isManaged to null', function () {
                    assert.isNull(this.item.isManaged);
                });

                it('sets content correct', function () {
                    assert.isPlainObject(this.item.content);
                    assert.lengthOfKeys(this.item.content, 0);
                });

                it('.isFolder() returns true', function () {
                    assert.isTrue(this.item.isFolder());
                });

                it('.isCurrentFolder() returns false', function () {
                    assert.isFalse(this.item.isCurrentFolder());
                });

                it('.isInCurrentFolder() returns false', function () {
                    assert.isFalse(this.item.isInCurrentFolder());
                });

                it('.isCurrentParentFolder() returns false', function () {
                    assert.isFalse(this.item.isCurrentParentFolder());
                });

                it('.isDomain() returns false', function () {
                    assert.isFalse(this.item.isDomain());
                });

                it('.isRoot() returns true', function () {
                    assert.isTrue(this.item.isRoot());
                });

                it('.isEmpty() returns true', function () {
                    assert.isTrue(this.item.isEmpty());
                });
            });

            describe('for folder href other than rootHref', function () {
                beforeEach(function () {
                    var instance = this.applyFn();
                    this.item = instance.get(this.xSettings.rootHref + 'a/');
                });

                it('returns object', function () {
                    assert.isObject(this.item);
                });

                it('sets href correct', function () {
                    assert.strictEqual(this.item.absHref, this.xSettings.rootHref + 'a/');
                });

                it('sets type correct', function () {
                    assert.strictEqual(this.item.type, this.xTypes.getType(this.absHref));
                });

                it('sets label correct', function () {
                    assert.strictEqual(this.item.label, 'a');
                });

                it('sets time to null', function () {
                    assert.isNull(this.item.time);
                });

                it('sets size to null', function () {
                    assert.isNull(this.item.size);
                });

                it('sets parent to object', function () {
                    assert.isObject(this.item.parent);
                });

                it('parent has same constructor', function () {
                    assert.strictEqual(this.item.constructor, this.item.parent.constructor);
                });

                it('sets isManaged to null', function () {
                    assert.isNull(this.item.isManaged);
                });

                it('sets content correct', function () {
                    assert.isPlainObject(this.item.content);
                    assert.lengthOfKeys(this.item.content, 0);
                });

                it('.isFolder() returns true', function () {
                    assert.isTrue(this.item.isFolder());
                });

                it('.isCurrentFolder() returns false', function () {
                    assert.isFalse(this.item.isCurrentFolder());
                });

                it('.isInCurrentFolder() returns false', function () {
                    assert.isFalse(this.item.isInCurrentFolder());
                });

                it('.isCurrentParentFolder() returns false', function () {
                    assert.isFalse(this.item.isCurrentParentFolder());
                });

                it('.isDomain() returns false', function () {
                    assert.isFalse(this.item.isDomain());
                });

                it('.isRoot() returns false', function () {
                    assert.isFalse(this.item.isRoot());
                });

                it('.isEmpty() returns true', function () {
                    assert.isTrue(this.item.isEmpty());
                });
            });

            describe('for file href', function () {
                beforeEach(function () {
                    var instance = this.applyFn();
                    this.item = instance.get(this.xSettings.rootHref + 'a');
                });

                it('returns object', function () {
                    assert.isObject(this.item);
                });

                it('sets href correct', function () {
                    assert.strictEqual(this.item.absHref, this.xSettings.rootHref + 'a');
                });

                it('sets type correct', function () {
                    assert.strictEqual(this.item.type, this.xTypes.getType(this.absHref));
                });

                it('sets label correct', function () {
                    assert.strictEqual(this.item.label, 'a');
                });

                it('sets time to null', function () {
                    assert.isNull(this.item.time);
                });

                it('sets size to null', function () {
                    assert.isNull(this.item.size);
                });

                it('sets parent to object', function () {
                    assert.isObject(this.item.parent);
                });

                it('parent has same constructor', function () {
                    assert.strictEqual(this.item.constructor, this.item.parent.constructor);
                });

                it('sets isManaged to null', function () {
                    assert.isNull(this.item.isManaged);
                });

                it('sets content correct', function () {
                    assert.isPlainObject(this.item.content);
                    assert.lengthOfKeys(this.item.content, 0);
                });

                it('.isFolder() returns false', function () {
                    assert.isFalse(this.item.isFolder());
                });

                it('.isCurrentFolder() returns false', function () {
                    assert.isFalse(this.item.isCurrentFolder());
                });

                it('.isInCurrentFolder() returns false', function () {
                    assert.isFalse(this.item.isInCurrentFolder());
                });

                it('.isCurrentParentFolder() returns false', function () {
                    assert.isFalse(this.item.isCurrentParentFolder());
                });

                it('.isDomain() returns false', function () {
                    assert.isFalse(this.item.isDomain());
                });

                it('.isRoot() returns false', function () {
                    assert.isFalse(this.item.isRoot());
                });

                it('.isEmpty() returns true', function () {
                    assert.isTrue(this.item.isEmpty());
                });
            });

            describe('parents', function () {
                beforeEach(function () {
                    var instance = this.applyFn();
                    this.item = instance.get(this.xSettings.rootHref + 'p/a/');
                    this.parent = this.item.parent;
                    this.grandpa = this.parent.parent;
                });

                it('parent is object', function () {
                    assert.isObject(this.parent);
                });

                it('parent has correct href', function () {
                    assert.strictEqual(this.parent.absHref, this.xSettings.rootHref + 'p/');
                });

                it('parent has correct label', function () {
                    assert.strictEqual(this.parent.label, 'p');
                });

                it('parent .isEmpty() returns false', function () {
                    assert.isFalse(this.parent.isEmpty());
                });

                it('grandpa is object', function () {
                    assert.isObject(this.grandpa);
                });

                it('grandpa has correct href', function () {
                    assert.strictEqual(this.grandpa.absHref, this.xSettings.rootHref);
                });

                it('grandpa has correct label', function () {
                    assert.strictEqual(this.grandpa.label, this.xRootName);
                });

                it('grandpa .isEmpty() returns false', function () {
                    assert.isFalse(this.grandpa.isEmpty());
                });
            });
        });

        describe('.remove()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isFunction(instance.remove);
            });
        });
    });
}());
