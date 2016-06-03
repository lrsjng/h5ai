const win = module.exports = global.window;

if (typeof win !== 'object' || win.window !== win || !win.document) {
    throw new Error('no-window');
}
