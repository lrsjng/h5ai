(function () {
    var title;
    var htmlId;
    var htmlClasses;
    var bodyId;
    var bodyClasses;
    var $pinnedElements;

    function pinHtml() {
        title = document.title;
        htmlId = $('html').attr('id');
        htmlClasses = $('html').attr('class');
        bodyId = $('body').attr('id');
        bodyClasses = $('body').attr('class');
        $pinnedElements = $('head,body').children();
    }

    function restoreHtml() {
        document.title = title;
        $('html').attr('id', htmlId);
        $('html').attr('class', htmlClasses);
        $('body').attr('id', bodyId);
        $('body').attr('class', bodyClasses);
        $('head,body').children().not($pinnedElements).remove();
        if (window.localStorage && window.localStorage.clear) {
            window.localStorage.clear();
        }
    }

    window.util = window.util || {};
    window.util.pinHtml = pinHtml;
    window.util.restoreHtml = restoreHtml;
}());
