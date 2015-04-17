modulejs.define('core/types', ['config', '_'], function (config, _) {

    var reEndsWithSlash = /\/$/;
    var regexps = {};


    function escapeRegExp(sequence) {

        return sequence.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$]/g, '\\$&');
        // return sequence.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

    function parse(types) {

        _.each(types, function (patterns, type) {

            var pattern = '^(' + _.map(patterns, function (p) { return '(' + escapeRegExp(p).replace(/\*/g, '.*') + ')'; }).join('|') + ')$';
            regexps[type] = new RegExp(pattern, 'i');
        });
    }

    function getType(sequence) {

        if (reEndsWithSlash.test(sequence)) {
            return 'folder';
        }

        var slashidx = sequence.lastIndexOf('/');
        var name = slashidx >= 0 ? sequence.substr(slashidx + 1) : sequence;
        var result;

        _.each(regexps, function (regexp, type) {

            if (regexps[type].test(name)) {
                result = type;
                return false;
            }
        });

        return result ? result : 'file';
    }


    parse(_.extend({}, config.types));

    return {
        getType: getType
    };
});
