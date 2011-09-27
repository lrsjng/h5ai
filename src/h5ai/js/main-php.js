/*global jQuery, h5aiOptions, h5aiLangs*/

// @include "inc/jquery.scrollpanel.js"
// @include "inc/jquery.utils.js"

(function($) {
    "use strict";

    var Objects = {},
        h5ai;

    // @include "inc/h5ai.js"

    h5ai = new Objects.H5ai(h5aiOptions, h5aiLangs);

    $.h5ai = {
        click: $.proxy(h5ai.pathClick, h5ai)
    };

    $(function () {

        h5ai.init();
        $("#tree").scrollpanel();
        h5ai.shiftTree(false, true);
    });

}(jQuery));
