modulejs.define('view/sidebar', ['$', 'core/resource', 'core/store'], function ($, resource, store) {

    var storekey = 'sidebarIsVisible';
    var toggleTemplate =
            '<div id="sidebar-toggle" class="tool">' +
                '<img alt="settings"/>' +
            '</div>';


    function update(toggle) {

        var $toggle = $('#sidebar-toggle');
        var $img = $toggle.find('img');
        var $sidebar = $('#sidebar');
        var isVisible = store.get(storekey);

        if (toggle) {
            isVisible = !isVisible;
            store.put(storekey, isVisible);
        }

        if (isVisible) {
            $toggle.addClass('current');
            $img.attr('src', resource.image('back'));
            $sidebar.show();
        } else {
            $toggle.removeClass('current');
            $img.attr('src', resource.image('settings'));
            $sidebar.hide();
        }
    }

    function init() {

        $(toggleTemplate)
            .appendTo('#toolbar')
            .on('click', function (ev) {

                update(true);
                ev.preventDefault();
            });

        update(false);
    }


    init();
});
