const globals = module.exports = {};

const publish = (id, name) => {
    if (!global[id]) {
        throw new Error(`no-global: ${id}`);
    }
    globals[name] = global[id];
};

publish('window', 'win');
publish('_', 'lo');
publish('jQuery', 'jq');
publish('marked', 'marked');
publish('Prism', 'prism');
