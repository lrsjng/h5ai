modulejs.define('view/sidebar', ['$', 'core/resource', 'core/store'], function ($, resource, store) {

    var storekey = 'sidebarIsVisible';
    var toggleTemplate =
            '<li id="sidebar-toggle" class="view">' +
                '<a href="#">' +
                    '<img src="' + resource.image('settings') + '" alt="settings"/>' +
                '</a>' +
            '</li>';


    function update(toggle) {

        var $toggle = $('#sidebar-toggle');
        var $sidebar = $('#sidebar');
        var isVisible = store.get(storekey);

        if (toggle) {
            isVisible = !isVisible;
            store.put(storekey, isVisible);
        }

        if (isVisible) {
            $toggle.addClass('current');
            $sidebar.show();
        } else {
            $toggle.removeClass('current');
            $sidebar.hide();
        }
    }

    function init() {

        $(toggleTemplate)
            .appendTo('#navbar')
            .on('click', 'a', function (ev) {

                update(true);
                ev.preventDefault();
            });

        update(false);
    }


    init();
});
