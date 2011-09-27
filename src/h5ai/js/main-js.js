/*global jQuery, h5aiOptions, h5aiLangs*/

// @include "inc/jquery.scrollpanel.js"
// @include "inc/jquery.utils.js"

(function($) {
    "use strict";

    var Objects = {},
        pathCache, h5ai, extended, tree;

    // @include "inc/h5ai.js"
    // @include "inc/path.js"
    // @include "inc/extended.js"
    // @include "inc/tree.js"

    pathCache = new Objects.PathCache();
    h5ai = new Objects.H5ai(h5aiOptions, h5aiLangs);
    extended = new Objects.Extended(pathCache, h5ai);
    tree = new Objects.Tree(pathCache, h5ai);

    $.h5ai = {
        click: $.proxy(h5ai.pathClick, h5ai)
    };

    $(function () {

        extended.init();
        tree.init();
        h5ai.init();
    });

}(jQuery));
