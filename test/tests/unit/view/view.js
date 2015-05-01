(function () {
'use strict';

var ID = 'view/view';
var DEPS = ['_', '$', 'core/event', 'core/format', 'core/location', 'core/resource', 'core/settings', 'view/content'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xEvent = {
            sub: sinon.stub(),
            pub: sinon.stub()
        };
        this.xFormat = {
            setDefaultMetric: sinon.stub(),
            formatDate: sinon.stub().returns(util.uniqId()),
            formatSize: sinon.stub().returns(util.uniqId())
        };
        this.xLocation = {
            setLink: sinon.stub().returns(util.uniqId())
        };
        this.xResource = {
            icon: sinon.stub().returns(util.uniqId())
        };
        this.xSettings = {view: {
            setParentFolderLabels: false
        }};
        this.xContent = {$el: null};

        this.applyFn = function () {

            this.xEvent.sub.reset();
            this.xEvent.pub.reset();
            this.xFormat.setDefaultMetric.reset();
            this.xFormat.formatDate.reset();
            this.xFormat.formatSize.reset();
            this.xLocation.setLink.reset();
            this.xResource.icon.reset();

            return this.definition.fn(_, $, this.xEvent, this.xFormat, this.xLocation, this.xResource, this.xSettings, this.xContent);
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

        it('returns object with 2 properties', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOfKeys(instance, 2);
        });

        it('adds HTML #view to #content', function () {

            this.applyFn();
            assert.lengthOf($('#content > #view'), 1);
        });

        it('adds HTML #items to #view', function () {

            this.applyFn();
            assert.lengthOf($('#view > #items'), 1);
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

    // describe('._.createHtml()', function () {

    //     before(function () {

    //         this.createItem = function () {

    //             return {
    //                 isFolder: sinon.stub().returns(false),
    //                 label: util.uniqId(),
    //                 time: 0,
    //                 size: 0,
    //                 type: util.uniqId(),
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
