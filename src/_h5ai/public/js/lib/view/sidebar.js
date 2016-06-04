const {jq} = require('../globals');
const resource = require('../core/resource');
const allsettings = require('../core/settings');
const store = require('../core/store');
const base = require('./base');


const settings = Object.assign({
    disableSidebar: false
}, allsettings.view);
const storekey = 'sidebarIsVisible';
const tplSidebar = '<div id="sidebar"/>';
const tplToggle =
        `<div id="sidebar-toggle" class="tool">
            <img alt="sidebar"/>
        </div>`;


const init = () => {
    const $sidebar = jq(tplSidebar);
    const $toggle = jq(tplToggle);
    const $img = $toggle.find('img');

    const update = toggle => {
        let isVisible = store.get(storekey);

        if (toggle) {
            isVisible = !isVisible;
            store.put(storekey, isVisible);
        }

        if (isVisible) {
            $toggle.addClass('active');
            $img.attr('src', resource.image('back'));
            $sidebar.show();
        } else {
            $toggle.removeClass('active');
            $img.attr('src', resource.image('sidebar'));
            $sidebar.hide();
        }
    };

    if (!settings.disableSidebar) {
        $sidebar.appendTo(base.$mainrow);
        $toggle.appendTo(base.$toolbar).on('click', () => update(true));
        update();
    }

    return {
        $el: $sidebar
    };
};

module.exports = init();
