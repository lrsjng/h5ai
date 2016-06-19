const {request} = require('./server');

const config = module.exports = {
    _update: query => request(query).then(resp => Object.assign(config, resp))
};
