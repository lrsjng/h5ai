const {request} = require('./core/server');

const config = module.exports = {
    _update: data => {
        return request(data).then(newConfig => {
            Object.assign(config, newConfig);
            return config;
        });
    }
};
