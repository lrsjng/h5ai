// Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
// Author: Jim Palmer (based on chunking idea from Dave Koelle)

// Modified to make it work with h5ai


const re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
const reStrip = /(^[ ]*|[ ]*$)/g;
const dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
const reHex = /^0x[0-9a-f]+$/i;
const reLeadingZero = /^0/;

const naturalCmp = (val1, val2) => {
    // convert all to strings strip whitespace
    const x = String(val1).replace(reStrip, '');
    const y = String(val2).replace(reStrip, '');
    // chunk/tokenize
    const xN = x.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
    const yN = y.replace(re, '\0$1\0').replace(/\0$/, '').replace(/^\0/, '').split('\0');
    // numeric, hex or date detection
    const xD = parseInt(x.match(reHex), 10) || xN.length !== 1 && x.match(dre) && Date.parse(x);
    const yD = parseInt(y.match(reHex), 10) || xD && y.match(dre) && Date.parse(y) || null;

    let oFxNcL;
    let oFyNcL;

    // first try and sort Hex codes or Dates
    if (yD) {
        if (xD < yD) {
            return -1;
        } else if (xD > yD) {
            return 1;
        }
    }

    // natural sorting through split numeric strings and default strings
    for (let cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc += 1) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(reLeadingZero) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(reLeadingZero) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
            return isNaN(oFxNcL) ? 1 : -1;
        } else if (typeof oFxNcL !== typeof oFyNcL) {
            // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
            oFxNcL = String(oFxNcL);
            oFxNcL = String(oFxNcL);
        }
        if (oFxNcL < oFyNcL) {
            return -1;
        }
        if (oFxNcL > oFyNcL) {
            return 1;
        }
    }

    return 0;
};

module.exports = {
    naturalCmp
};
