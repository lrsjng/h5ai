const {dom} = require('../util');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');
const base = require('./base');


const settings = Object.assign({
    disableSidebar: false
}, allsettings.view);
const storekey = 'sidebarIsVisible';
const sidebarTpl = '<div id="sidebar"></div>';
const toggleTpl =
        `<div id="sidebar-toggle" class="tool">
            <img alt="sidebar"/>
        </div>`;


const init = () => {
    const $sidebar = dom(sidebarTpl).hide();
    const $toggle = dom(toggleTpl);
    const $img = $toggle.find('img');

    const update = toggle => {
        let isVisible = store.get(storekey);

        if (toggle) {
            isVisible = !isVisible;
            store.put(storekey, isVisible);
        }

        if (isVisible) {
            $toggle.addCls('active');
            $img.attr('src', resource.image('back'));
            $sidebar.show();
        } else {
            $toggle.rmCls('active');
            $img.attr('src', resource.image('sidebar'));
            $sidebar.hide();
        }
    };

    if (!settings.disableSidebar) {
        $sidebar.appTo(base.$mainrow);
        $toggle.appTo(base.$toolbar).on('click', () => update(true));
        update();
    }

    return {
        $el: $sidebar
    };
};

module.exports = init();
