modulejs.define('ext/peer5', ['_', '$', 'core/settings'], function (_, $, allsettings) {

        var settings = _.extend({
            enabled: false,
            id:'z142i5n5qypq4cxr'
        }, allsettings.peer5);


    function init() {

        if (!settings.enabled) {
            return;
        }

        var peer5js = '//api.peer5.com/peer5.js?id=' + settings.id;
        //load peer5 with caching
        $.ajax({
            url: peer5js,
            dataType: "script",
            cache:true
        });

        //attach to file items, once the DOM is ready
        $(document).ready(function() {
            $('body').on('click', '.item.file > a', function (e) {
                if (window.peer5) {
                    e.preventDefault();
                    var url = e.currentTarget.href;
                    window.peer5.download(url);
                    return false;
                }
            });
        });
    }

    init();
});

