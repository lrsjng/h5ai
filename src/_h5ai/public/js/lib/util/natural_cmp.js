// Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
// Author: Jim Palmer (based on chunking idea from Dave Koelle)

// Modified to make it work with h5ai

const RE_TOKEN = /(^([+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[0-9a-f]+$|\d+)/gi;
const RE_DATE = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
const RE_HEX = /^0x[0-9a-f]+$/i;
const RE_LEADING_ZERO = /^0/;

/* eslint-disable complexity */
const natural_cmp = (a, b) => {
    // convert all to strings strip whitespace
    const x = String(a).trim();
    const y = String(b).trim();

    // chunk/tokenize
    const x_toks = x.replace(RE_TOKEN, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
    const y_toks = y.replace(RE_TOKEN, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');

    // first try and sort Hex codes or Dates
    const x_date = parseInt(x.match(RE_HEX), 16) || x_toks.length !== 1 && x.match(RE_DATE) && Date.parse(x);
    const y_date = parseInt(y.match(RE_HEX), 16) || x_date && y.match(RE_DATE) && Date.parse(y) || null;
    if (y_date) {
        if (x_date < y_date) {
            return -1;
        }
        if (x_date > y_date) {
            return 1;
        }
    }

    // natural sorting through split numeric strings and default strings
    for (let idx = 0, len = Math.max(x_toks.length, y_toks.length); idx < len; idx += 1) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        let x_tok = !(x_toks[idx] || '').match(RE_LEADING_ZERO) && parseFloat(x_toks[idx]) || x_toks[idx] || 0;
        let y_tok = !(y_toks[idx] || '').match(RE_LEADING_ZERO) && parseFloat(y_toks[idx]) || y_toks[idx] || 0;

        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(x_tok) !== isNaN(y_tok)) {
            return isNaN(x_tok) ? 1 : -1;
        }

        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        if (typeof x_tok !== typeof y_tok) {
            x_tok = String(x_tok);
            y_tok = String(y_tok);
        }

        if (x_tok < y_tok) {
            return -1;
        }
        if (x_tok > y_tok) {
            return 1;
        }
    }
    return 0;
};
/* eslint-enable */

module.exports = {
    naturalCmp: natural_cmp
};
