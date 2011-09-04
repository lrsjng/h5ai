(function($) {
    "use strict";
    /*global jQuery, h5aiOptions, h5aiLangs*/

    // @include "inc/jquery.mousewheel.min.js"
    // @include "inc/jquery.scrollpanel.js"
    // @include "inc/jquery.utils.js"
    // @include "inc/jquery.fracs.js"
    // @include "inc/h5ai.js"

    var h5ai = new H5ai(h5aiOptions, h5aiLangs);

    $.h5ai = {
        click: $.proxy(h5ai.pathClick, h5ai)
    };

    $(function () {

        h5ai.init();
        $("#tree").scrollpanel();
        h5ai.shiftTree(false, true);
    });

})(jQuery);
