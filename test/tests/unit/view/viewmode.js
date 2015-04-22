(function () {
'use strict';

var ID = 'view/viewmode';
var DEPS = ['_', '$', 'core/event', 'core/resource', 'core/settings', 'core/store'];

describe('module "' + ID + '"', function () {

    before(function () {

        this.definition = modulejs._private.definitions[ID];

        this.xSettings = {
            view: {}
        };
        this.xResource = {
            image: sinon.stub().returns('/some/path/' + util.uniqId() + '.png')
        };
        this.xStore = {
            get: sinon.stub(),
            put: sinon.stub()
        };
        this.xEvent = {
            sub: sinon.stub()
        };
        this.applyFn = function () {

            this.xResource.image.reset();
            this.xStore.get.reset();
            this.xStore.put.reset();
            this.xEvent.sub.reset();

            return this.definition.fn(_, $, this.xEvent, this.xResource, this.xSettings, this.xStore);
        };
    });

    after(function () {

        util.restoreHtml();
    });

    beforeEach(function () {

        util.restoreHtml();
        $('<div id="sidebar"/>').appendTo('body');
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

        it('adds HTML', function () {

            this.applyFn();
            assert.lengthOf($('#sidebar > .block > .l10n-view'), 1);
        });

        it('adds Style', function () {

            var styleTagCount = $('head > style').length;
            this.applyFn();
            assert.lengthOf($('head > style'), styleTagCount + 1);
        });

        it('subscribes to 1 event', function () {

            this.applyFn();
            assert.isTrue(this.xEvent.sub.calledOnce);
        });

        it('subscribes to "location.changed"', function () {

            this.applyFn();
            assert.strictEqual(this.xEvent.sub.firstCall.args[0], 'location.changed');
            assert.isFunction(this.xEvent.sub.firstCall.args[1]);
        });
    });
});

}());
