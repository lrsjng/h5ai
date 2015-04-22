(function () {
'use strict';

var ID = 'view/content';
var DEPS = ['_', '$', 'core/event', 'core/format', 'core/location', 'core/resource', 'core/settings'];

describe('module "' + ID + '"', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xSettings = util.uniqObj();
        this.xResource = {
            icon: sinon.stub().returns('/some/path/' + util.uniqId() + '-icon.png')
        };
        this.xFormat = {
            formatSize: sinon.stub().returns(util.uniqId()),
            formatDate: sinon.stub().returns(util.uniqId()),
            setDefaultMetric: sinon.stub()
        };
        this.xEvent = {
            sub: sinon.stub(),
            pub: sinon.stub()
        };
        this.xLocation = {
            setLink: sinon.stub()
        };
        this.applyFn = function () {

            this.xResource.icon.reset();
            this.xFormat.formatSize.reset();
            this.xFormat.formatDate.reset();
            this.xFormat.setDefaultMetric.reset();
            this.xEvent.sub.reset();
            this.xEvent.pub.reset();
            this.xLocation.setLink.reset();

            return this.definition.fn(_, $, this.xEvent, this.xFormat, this.xLocation, this.xResource, this.xSettings);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        $('<div id="main-row"/>').appendTo('body');
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

        it('adds HTML #content', function () {

            this.applyFn();
            assert.lengthOf($('#main-row > #content'), 1);
        });

        it('sets default metric', function () {

            this.applyFn();
            assert.isTrue(this.xFormat.setDefaultMetric.calledOnce);
        });

        it('subscribes to 2 events', function () {

            this.applyFn();
            assert.isTrue(this.xEvent.sub.calledTwice);
        });

        it('subscribes to "location.changed"', function () {

            this.applyFn();
            assert.strictEqual(this.xEvent.sub.firstCall.args[0], 'location.changed');
            assert.isFunction(this.xEvent.sub.firstCall.args[1]);
        });

        it('subscribes to "location.refreshed"', function () {

            this.applyFn();
            assert.strictEqual(this.xEvent.sub.secondCall.args[0], 'location.refreshed');
            assert.isFunction(this.xEvent.sub.secondCall.args[1]);
        });
    });
});

}());
