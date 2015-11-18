(function () {
    var ID = 'view/view';
    var DEPS = ['_', '$', 'core/event', 'core/format', 'core/location', 'core/resource', 'core/settings', 'core/store', 'view/content'];

    describe('module \'' + ID + '\'', function () {
        before(function () {
            this.definition = modulejs._private.definitions[ID];

            this.xEvent = {
                sub: sinon.stub(),
                pub: sinon.stub()
            };
            this.xFormat = {
                setDefaultMetric: sinon.stub(),
                formatDate: sinon.stub().returns(uniq.id()),
                formatSize: sinon.stub().returns(uniq.id())
            };
            this.xLocation = {
                setLink: sinon.stub().returns(uniq.id())
            };
            this.xResource = {
                icon: sinon.stub().returns(uniq.id())
            };
            this.xSettings = {view: {
                binaryPrefix: false,
                hideFolders: false,
                hideParentFolder: false,
                modes: ['details', 'grid', 'icons'],
                setParentFolderLabels: false,
                sizes: [20, 40, 60, 80, 100, 150, 200, 250, 300, 350, 400]
            }};
            this.xStore = {
                get: sinon.stub(),
                put: sinon.stub()
            };
            this.xContent = {$el: null};

            this.applyFn = function () {
                this.xEvent.sub.reset();
                this.xEvent.pub.reset();
                this.xFormat.setDefaultMetric.reset();
                this.xFormat.formatDate.reset();
                this.xFormat.formatSize.reset();
                this.xLocation.setLink.reset();
                this.xResource.icon.reset();

                return this.definition.fn(_, $, this.xEvent, this.xFormat, this.xLocation, this.xResource, this.xSettings, this.xStore, this.xContent);
            };
        });

        after(function () {
            util.restoreHtml();
        });

        beforeEach(function () {
            util.restoreHtml();
            this.xContent.$el = $('<div id="content"/>').appendTo('body');
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
            it('returns object with 12 properties', function () {
                var instance = this.applyFn();
                assert.isPlainObject(instance);
                assert.lengthOfKeys(instance, 12);
            });

            it('adds HTML #view to #content', function () {
                this.applyFn();
                assert.lengthOf($('#content > #view'), 1);
            });

            it('adds HTML #items to #view', function () {
                this.applyFn();
                assert.lengthOf($('#view > #items'), 1);
            });

            it('adds HTML #view-hint to #view', function () {
                this.applyFn();
                assert.lengthOf($('#view > #view-hint'), 1);
            });

            it('adds style to head', function () {
                var styleTagCount = $('head > style').length;
                this.applyFn();
                assert.lengthOf($('head > style'), styleTagCount + 1);
            });

            it('style contains possibly correct text', function () {
                this.xSettings.sizes = [20];
                this.applyFn();
                var text = $('head > style').eq(0).text();
                assert.isTrue(text.indexOf('#view.view-details.view-size-20 ') >= 0);
                assert.isTrue(text.indexOf('#view.view-grid.view-size-20 ') >= 0);
                assert.isTrue(text.indexOf('#view.view-icons.view-size-20 ') >= 0);
            });

            it('sets default metric', function () {
                this.applyFn();
                assert.isTrue(this.xFormat.setDefaultMetric.calledOnce);
            });

            it('subscribes to 2 events', function () {
                this.applyFn();
                assert.isTrue(this.xEvent.sub.calledTwice);
            });

            it('subscribes to location.changed', function () {
                this.applyFn();
                assert.strictEqual(this.xEvent.sub.firstCall.args[0], 'location.changed');
                assert.isFunction(this.xEvent.sub.firstCall.args[1]);
            });

            it('subscribes to location.refreshed', function () {
                this.applyFn();
                assert.strictEqual(this.xEvent.sub.secondCall.args[0], 'location.refreshed');
                assert.isFunction(this.xEvent.sub.secondCall.args[1]);
            });
        });

        describe('.$el', function () {
            it('is $(\'#view\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$el);
                assert.lengthOf(instance.$el, 1);
                assert.isString(instance.$el.jquery);
                assert.strictEqual(instance.$el.attr('id'), 'view');
            });
        });

        describe('.$items', function () {
            it('is $(\'#items\')', function () {
                var instance = this.applyFn();
                assert.isObject(instance.$items);
                assert.lengthOf(instance.$items, 1);
                assert.isString(instance.$items.jquery);
                assert.strictEqual(instance.$items.attr('id'), 'items');
            });
        });

        describe('.setItems()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.setItems));
            });

            it('publishes view.changed', function () {
                var instance = this.applyFn();
                instance.setItems();
                assert.isTrue(this.xEvent.pub.calledTwice);
                assert.strictEqual(this.xEvent.pub.lastCall.args[0], 'view.changed');
            });
        });

        describe('.changeItems()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.changeItems));
            });

            it('publishes view.changed', function () {
                var instance = this.applyFn();
                instance.setItems();
                assert.isTrue(this.xEvent.pub.calledTwice);
                assert.strictEqual(this.xEvent.pub.lastCall.args[0], 'view.changed');
            });
        });

        describe('.setLocation()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.setLocation));
            });

            it('publishes view.changed', function () {
                var instance = this.applyFn();
                instance.setItems();
                assert.isTrue(this.xEvent.pub.calledTwice);
                assert.strictEqual(this.xEvent.pub.lastCall.args[0], 'view.changed');
            });
        });

        describe('.setHint()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.setHint));
            });

            it('sets correct class to #view-hint', function () {
                var key = uniq.id();
                var instance = this.applyFn();
                instance.setHint(key);
                assert.strictEqual($('#view-hint').attr('class'), 'l10n-' + key);
            });

            it('removes all other classes from #view-hint', function () {
                var key = uniq.id();
                var instance = this.applyFn();
                $('#view-hint').addClass('a');
                instance.setHint(key);
                assert.strictEqual($('#view-hint').attr('class'), 'l10n-' + key);
            });
        });

        describe('.getModes()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.getModes));
            });
        });

        describe('.getMode()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.getMode));
            });
        });

        describe('.setMode()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.setMode));
            });

            it('.setMode(\'details\') changes #view class to .view-details', function () {
                this.xSettings.view.modes = ['details', 'grid', 'icons'];
                var instance = this.applyFn();
                instance.setMode('details');
                assert.isTrue($('#view').hasClass('view-details'));
                assert.isFalse($('#view').hasClass('view-grid'));
                assert.isFalse($('#view').hasClass('view-icons'));
            });

            it('.setMode(\'grid\') changes #view class to .view-grid', function () {
                this.xSettings.view.modes = ['details', 'grid', 'icons'];
                var instance = this.applyFn();
                instance.setMode('grid');
                assert.isFalse($('#view').hasClass('view-details'));
                assert.isTrue($('#view').hasClass('view-grid'));
                assert.isFalse($('#view').hasClass('view-icons'));
            });

            it('.setMode(\'icons\') changes #view class to .view-icons', function () {
                this.xSettings.view.modes = ['details', 'grid', 'icons'];
                var instance = this.applyFn();
                instance.setMode('icons');
                assert.isFalse($('#view').hasClass('view-details'));
                assert.isFalse($('#view').hasClass('view-grid'));
                assert.isTrue($('#view').hasClass('view-icons'));
            });
        });

        describe('.getSizes()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.getSizes));
            });

            it('returns sorted sizes', function () {
                this.xSettings.view.sizes = [20, 60, 40];
                var instance = this.applyFn();
                assert.deepEqual(instance.getSizes(), [20, 40, 60]);
            });

            it('returns sorted sizes', function () {
                this.xSettings.view.sizes = [60, 40, 20];
                var instance = this.applyFn();
                assert.deepEqual(instance.getSizes(), [20, 40, 60]);
            });
        });

        describe('.getSize()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.getSize));
            });
        });

        describe('.setSize()', function () {
            it('is function', function () {
                var instance = this.applyFn();
                assert.isTrue(_.isFunction(instance.setSize));
            });

            it('.setSize(20) changes #view class to .view-size-20', function () {
                this.xSettings.view.sizes = [20, 40, 60];
                var instance = this.applyFn();
                instance.setSize(20);
                assert.isTrue($('#view').hasClass('view-size-20'), 20);
                assert.isFalse($('#view').hasClass('view-size-40'), 40);
                assert.isFalse($('#view').hasClass('view-size-60'), 60);
            });

            it('.setSize(40) changes #view class to .view-size-40', function () {
                this.xSettings.view.sizes = [20, 40, 60];
                var instance = this.applyFn();
                instance.setSize(20);
                instance.setSize(40);
                assert.isFalse($('#view').hasClass('view-size-20'), 20);
                assert.isTrue($('#view').hasClass('view-size-40'), 40);
                assert.isFalse($('#view').hasClass('view-size-60'), 60);
            });

            it('.setSize(60) changes #view class to .view-size-60', function () {
                this.xSettings.view.sizes = [20, 40, 60];
                var instance = this.applyFn();
                instance.setSize(20);
                instance.setSize(60);
                assert.isFalse($('#view').hasClass('view-size-20'), 20);
                assert.isFalse($('#view').hasClass('view-size-40'), 40);
                assert.isTrue($('#view').hasClass('view-size-60'), 60);
            });
        });

        // describe('._.createHtml()', function () {
        //     before(function () {
        //         this.createItem = function () {
        //             return {
        //                 isFolder: sinon.stub().returns(false),
        //                 label: uniq.id(),
        //                 time: 0,
        //                 size: 0,
        //                 type: uniq.id(),
        //                 isManaged: false,
        //                 icon: null,
        //                 isCurrentParentFolder: sinon.stub().returns(false)
        //             };
        //         };
        //     });

        //     it('is function', function () {
        //         var instance = this.applyFn();
        //         assert.isFunction(instance._.createHtml);
        //     });

        //     it('returns jQuery instance of single HTML element', function () {
        //         var item = this.createItem();
        //         var instance = this.applyFn();
        //         var $item = instance._.createHtml(item);
        //         assert.isObject($item);
        //         assert.lengthOf($item, 1);
        //         assert.isString($item.jquery);
        //     });

        //     it('$item.data(\'item\') is back reference to item', function () {
        //         var item = this.createItem();
        //         var instance = this.applyFn();
        //         var $item = instance._.createHtml(item);
        //         assert.strictEqual($item.data('item'), item);
        //     });

        //     it('sets item.$view as reference to $item', function () {
        //         var item = this.createItem();
        //         var instance = this.applyFn();
        //         var $item = instance._.createHtml(item);
        //         assert.strictEqual(item.$view, $item);
        //     });
        // });
    });
}());
