const {_: lo} = require('../win');
const config = require('../config');

const reEndsWithSlash = /\/$/;
const regexps = {};


function escapeRegExp(sequence) {
    return sequence.replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$]/g, '\\$&');
    // return sequence.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function parse(types) {
    lo.each(types, (patterns, type) => {
        const pattern = '^(' + lo.map(patterns, p => '(' + escapeRegExp(p).replace(/\*/g, '.*') + ')').join('|') + ')$';
        regexps[type] = new RegExp(pattern, 'i');
    });
}

function getType(sequence) {
    if (reEndsWithSlash.test(sequence)) {
        return 'folder';
    }

    const slashidx = sequence.lastIndexOf('/');
    const name = slashidx >= 0 ? sequence.substr(slashidx + 1) : sequence;
    let result;

    lo.each(regexps, (regexp, type) => { // eslint-disable-line consistent-return
        if (regexps[type].test(name)) {
            result = type;
            return false;
        }
    });

    return result ? result : 'file';
}


parse(Object.assign({}, config.types));

module.exports = {
    getType
};
