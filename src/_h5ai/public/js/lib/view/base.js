const {dom} = require('../util');

const rootSelector = 'body';
const topbarTpl =
        `<div id="topbar">
            <div id="toolbar"></div>
            <div id="flowbar"></div>
            <a id="backlink" href="https://larsjung.de/h5ai/" title="powered by h5ai - https://larsjung.de/h5ai/">
                <div>powered</div>
                <div>by h5ai</div>
            </a>
        </div>`;
const mainrowTpl =
        `<div id="mainrow">
            <div id="content"></div>
        </div>`;

const init = () => {
    dom('#fallback, #fallback-hints').rm();

    const $root = dom(rootSelector)
        .attr('id', 'root')
        .app(topbarTpl)
        .app(mainrowTpl);

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
