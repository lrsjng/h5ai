const globals = module.exports = {};

const add = (id, as) => {
    if (!global[id]) {
        throw new Error(`no-global: ${id}`);
    }
    globals[as] = global[id];
};

add('window', 'win');
add('Prism', 'prism');
