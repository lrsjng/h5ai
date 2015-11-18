(function () {
    describe('libs', function () {
        var libs = {
            _: window._,
            $: window.jQuery,
            marked: window.marked,
            prism: window.Prism
        };

        _.each(libs, function (lib, id) {
            describe('module \'' + id + '\'', function () {
                it('is defined', function () {
                    assert.isDefined(modulejs._private.definitions[id]);
                });

                it('has no instance', function () {
                    assert.notProperty(modulejs._private.instances, id);
                });

                it('returns global lib', function () {
                    var definition = modulejs._private.definitions[id];
                    var instance = definition.fn();
                    assert.isDefined(instance);
                    assert.strictEqual(instance, lib);
                });
            });
        });
    });
}());
