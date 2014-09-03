modulejs.define('view/sidebar', ['$', 'core/resource', 'core/store'], function ($, resource, store) {

    var storekey = 'sidebarIsVisible';
    var toggleTemplate =
            '<li id="sidebar-toggle" class="view">' +
                '<a href="#">' +
                    '<img src="' + resource.image('settings') + '" alt="settings"/>' +
                '</a>' +
            '</li>';


    function update(toggle, animate) {

        var $toggle = $('#sidebar-toggle');
        var $sidebar = $('#sidebar');
        var isVisible = store.get(storekey);

        if (toggle) {
            isVisible = !isVisible;
            store.put(storekey, isVisible);
        }

        if (isVisible) {
            $toggle.addClass('current');
        } else {
            $toggle.removeClass('current');
        }

        if (animate) {
            $sidebar.stop().animate({
                right: isVisible ? 0 : -$sidebar.outerWidth()-1
            });
        } else {
            $sidebar.css({
                right: store.get(storekey) ? 0 : -$sidebar.outerWidth()-1
            });
        }
    }

    function init() {

        $(toggleTemplate)
            .on('click', 'a', function (ev) {

                update(true, true);
                ev.preventDefault();
            })
            .appendTo('#navbar');

        update(false, false);
    }


    init();
});
