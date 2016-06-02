const {jQuery: jq} = require('../win');
const root = require('./root');

const tplTopbar =
        `<div id="topbar">
            <div id="toolbar"/>
            <div id="flowbar"/>
            <a id="backlink" href="https://larsjung.de/h5ai/" title="powered by h5ai - https://larsjung.de/h5ai/">
                <div>powered</div>
                <div>by h5ai</div>
            </a>
        </div>`;
const $el = jq(tplTopbar).appendTo(root.$el);

module.exports = {
    $el,
    $toolbar: $el.find('#toolbar'),
    $flowbar: $el.find('#flowbar')
};
