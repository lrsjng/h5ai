const win = window; // eslint-disable-line no-undef

if (typeof win !== 'object' || win.window !== win || !win.document) {
    throw new Error('no-window');
}

const noBrowser = 'no-browser';
const doc = win.document;
const docEl = doc.documentElement;
docEl.className = '';

function assert(expr, hint) {
    if (!expr) {
        docEl.className = noBrowser;
        throw new Error(`${noBrowser}: ${hint}`);
    }
}

assert(!doc.getElementById(noBrowser), 'ie<10');
assert(typeof Object.assign === 'function', 'assign');
assert(typeof Promise === 'function', 'promise');

module.exports = win;
