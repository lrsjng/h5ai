const globals = module.exports = {};

const publish = (id, name) => {
    if (!global[id]) {
        throw new Error(`no-global: ${id}`);
    }
    globals[name] = global[id];
};

publish('window', 'win');
publish('kjua', 'kjua');
publish('marked', 'marked');
publish('Prism', 'prism');
