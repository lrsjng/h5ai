const regularCmp = (x, y) => x < y ? -1 : x > y ? 1 : 0;

const escapePattern = sequence => {
    return sequence.replace(/[\-\[\]{}()*+?.,\\$\^|#\s]/g, '\\$&');
};

const parsePattern = (sequence, advanced) => {
    if (!advanced) {
        return escapePattern(sequence);
    }

    if (sequence.substr(0, 3) === 're:') {
        return sequence.substr(3);
    }

    return sequence.trim().split(/\s+/).map(part => {
        return part.split('').map(char => escapePattern(char)).join('.*?');
    }).join('|');
};

module.exports = {
    regularCmp,
    parsePattern
};
