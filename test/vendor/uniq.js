/* uniq 0.3.1 - http://larsjung.de/uniq/ */
(function (root, factory) {
    'use strict';

    if (typeof module !== 'undefined') {
        module.exports = factory();
    } else {
        root.uniq = factory();
    }
}(this, function () {
    'use strict';

    var PREFIX = 'UNIQ-';
    var SUFFIX = '-ID';
    var LENGTH = 4;
    var ZERO_PAD = new Array(LENGTH + 1).join('0');
    var RE_ID = new RegExp('^' + PREFIX + '\\d{' + LENGTH + '}' + SUFFIX + '$');

    var counter = 0;

    function id() {

        counter += 1;
        return PREFIX + (ZERO_PAD + counter).substr(-LENGTH) + SUFFIX;
    }

    function isId(sequence) {

        return RE_ID.test(sequence);
    }

    function obj() {

        return {_uniq_id: id()};
    }

    function path(suffix) {

        return '/_uniq_path/' + id() + (suffix ? suffix : '');
    }

    return {
        id: id,
        isId: isId,
        obj: obj,
        path: path
    };
}));
