(function () {
'use strict';

var ID = 'view/item';
var DEPS = ['_', '$', 'core/format', 'core/location', 'core/resource', 'core/settings'];

describe('module \'' + ID + '\'', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xFormat = {
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

        this.applyFn = function () {

            this.xFormat.formatDate.reset();
            this.xFormat.formatSize.reset();
            this.xLocation.setLink.reset();
            this.xResource.icon.reset();

            return this.definition.fn(_, $, this.xFormat, this.xLocation, this.xResource, this.xSettings);
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

        it('returns object with 1 property', function () {

            var instance = this.applyFn();
            assert.isPlainObject(instance);
            assert.lengthOfKeys(instance, 1);
        });
    });

    describe('.render()', function () {

        before(function () {

            this.createItem = function () {

                return {
                    isFolder: sinon.stub().returns(false),
                    label: util.uniqId(),
                    time: 0,
                    size: 0,
                    type: util.uniqId(),
                    isManaged: false,
                    icon: null,
                    isCurrentParentFolder: sinon.stub().returns(false)
                };
            };
        });

        it('is function', function () {

            var instance = this.applyFn();
            assert.isFunction(instance.render);
        });

        it('returns jQuery instance of single HTML element', function () {

            var item = this.createItem();
            var instance = this.applyFn();
            var $item = instance.render(item);
            assert.isObject($item);
            assert.lengthOf($item, 1);
            assert.isString($item.jquery);
        });

        it('$item.data(\'item\') is back reference to item', function () {

            var item = this.createItem();
            var instance = this.applyFn();
            var $item = instance.render(item);
            assert.strictEqual($item.data('item'), item);
        });

        it('sets item.$view as reference to $item', function () {

            var item = this.createItem();
            var instance = this.applyFn();
            var $item = instance.render(item);
            assert.strictEqual(item.$view, $item);
        });
    });
});

}());
