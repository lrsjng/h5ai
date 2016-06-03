const {jq} = require('../globals');
const resource = require('../core/resource');
const store = require('../core/store');
const mainrow = require('./mainrow');
const topbar = require('./topbar');


const storekey = 'sidebarIsVisible';
const tplSidebar = '<div id="sidebar"/>';
const tplToggle =
        `<div id="sidebar-toggle" class="tool">
            <img alt="sidebar"/>
        </div>`;
const $sidebar = jq(tplSidebar);
const $toggle = jq(tplToggle);
const $img = $toggle.find('img');


function update(toggle) {
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
}


$sidebar.appendTo(mainrow.$el);
$toggle.appendTo(topbar.$toolbar).on('click', () => update(true));
update();

module.exports = {
    $el: $sidebar
};
