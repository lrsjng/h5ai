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
        const pattern = '^(' + map(patterns.glob, p => '(' + escapeRegExp(p).replace(/\*/g, '.*') + ')').join('|') + ')$';
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

    let types = Object.keys(regexps);
    for (let i = 0; i < types.length; ++i) {
        if (regexps[types[i]].test(name)) {
            result = types[i];
            break;
        };
    }

    return result ? result : 'file';
};


parse(Object.assign({}, config.types));

module.exports = {
    getType
};
