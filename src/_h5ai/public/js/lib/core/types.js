const {each, map} = require('../util');
const config = require('../config');

const reEndsWithSlash = /\/$/;
const regexps = {};


const escapeRegExp = sequence => {
    return sequence.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$]/g, '\\$&');
    // return sequence.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

const parse = types => {
    each(types, (patterns, type) => {
        const pattern = '^(' + map(patterns, p => '(' + escapeRegExp(p).replace(/\*/g, '.*') + ')').join('|') + ')$';
        regexps[type] = new RegExp(pattern, 'i');
    });
};

const getType = sequence => {
    if (reEndsWithSlash.test(sequence)) {
        return 'folder';
    }

    const slashidx = sequence.lastIndexOf('/');
    const name = slashidx >= 0 ? sequence.substr(slashidx + 1) : sequence;
    let result;

    each(regexps, (regexp, type) => {
        if (regexps[type].test(name)) {
            result = type;
        }
    });

    return result ? result : 'file';
};


parse(Object.assign({}, config.types));

module.exports = {
    getType
};
