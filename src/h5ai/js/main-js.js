(function($) {
    "use strict";
    /*global jQuery, h5aiOptions, h5aiLangs*/

    // @include "inc/jquery.mousewheel.min.js"
    // @include "inc/jquery.scrollpanel.js"
    // @include "inc/jquery.utils.js"
    // @include "inc/jquery.fracs.js"
    // @include "inc/path.js"
    // @include "inc/h5ai.js"
    // @include "inc/extended.js"
    // @include "inc/tree.js"

    var pathCache = new PathCache(),
        h5ai = new H5ai(h5aiOptions, h5aiLangs),
        extended = new Extended(pathCache, h5ai),
        tree = new Tree(pathCache, h5ai);

    $.h5ai = {
        click: $.proxy(h5ai.pathClick, h5ai)
    };

    $(function () {

        extended.init();
        tree.init();
        h5ai.init();
    });

}(jQuery));
