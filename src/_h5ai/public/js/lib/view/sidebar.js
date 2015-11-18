modulejs.define('view/sidebar', ['$', 'core/resource', 'core/store', 'view/mainrow', 'view/topbar'], function ($, resource, store, mainrow, topbar) {
    var storekey = 'sidebarIsVisible';
    var tplSidebar = '<div id="sidebar"/>';
    var tplToggle =
            '<div id="sidebar-toggle" class="tool">' +
                '<img alt="sidebar"/>' +
            '</div>';
    var $sidebar = $(tplSidebar);
    var $toggle = $(tplToggle);
    var $img = $toggle.find('img');


    function update(toggle) {
        var isVisible = store.get(storekey);

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
    $toggle.appendTo(topbar.$toolbar).on('click', function () { update(true); });
    update(false);

    return {
        $el: $sidebar
    };
});
