// Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
// Author: Jim Palmer (based on chunking idea from Dave Koelle)

// Modified to make it work with h5ai

const reToken = /(^([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi;
const reDate = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
const reHex = /^0x[0-9a-f]+$/i;
const reLeadingZero = /^0/;

/* eslint-disable complexity */
const naturalCmp = (a, b) => {
    // convert all to strings strip whitespace
    const x = String(a).trim();
    const y = String(b).trim();

    // chunk/tokenize
    const xTokens = x.replace(reToken, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
    const yTokens = y.replace(reToken, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');

    // first try and sort Hex codes or Dates
    const xDate = parseInt(x.match(reHex), 16) || xTokens.length !== 1 && x.match(reDate) && Date.parse(x);
    const yDate = parseInt(y.match(reHex), 16) || xDate && y.match(reDate) && Date.parse(y) || null;
    if (yDate) {
        if (xDate < yDate) {
            return -1;
        }
        if (xDate > yDate) {
            return 1;
        }
    }

    // natural sorting through split numeric strings and default strings
    for (let idx = 0, len = Math.max(xTokens.length, yTokens.length); idx < len; idx += 1) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        let xToken = !(xTokens[idx] || '').match(reLeadingZero) && parseFloat(xTokens[idx]) || xTokens[idx] || 0;
        let yToken = !(yTokens[idx] || '').match(reLeadingZero) && parseFloat(yTokens[idx]) || yTokens[idx] || 0;

        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(xToken) !== isNaN(yToken)) {
            return isNaN(xToken) ? 1 : -1;
        }

        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        if (typeof xToken !== typeof yToken) {
            xToken = String(xToken);
            yToken = String(yToken);
        }

        if (xToken < yToken) {
            return -1;
        }
        if (xToken > yToken) {
            return 1;
        }
    }
    return 0;
};
/* eslint-enable */

module.exports = {
    naturalCmp
};
