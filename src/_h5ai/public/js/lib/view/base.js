const {jq} = require('../globals');

const rootSelector = 'body';
const tplTopbar =
        `<div id="topbar">
            <div id="toolbar"/>
            <div id="flowbar"/>
            <a id="backlink" href="https://larsjung.de/h5ai/" title="powered by h5ai - https://larsjung.de/h5ai/">
                <div>powered</div>
                <div>by h5ai</div>
            </a>
        </div>`;
const tplMainrow =
        `<div id="mainrow">
            <div id="content"/>
        </div>`;

const init = () => {
    jq('#fallback, #fallback-hints').remove();

    const $root = jq(rootSelector)
        .attr('id', 'root')
        .append(tplTopbar)
        .append(tplMainrow);

    return {
        $root,
        $topbar: $root.find('#topbar'),
        $toolbar: $root.find('#toolbar'),
        $flowbar: $root.find('#flowbar'),
        $mainrow: $root.find('#mainrow'),
        $content: $root.find('#content')
    };
};

module.exports = init();
