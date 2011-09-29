/*global jQuery, h5aiOptions, h5aiLangs*/

// @include "inc/jquery.scrollpanel.js"
// @include "inc/jquery.utils.js"

(function($) {
    "use strict";

    var H5aiJs = {
            factory: {},
            init: function () {
                this.h5ai = new this.factory.H5ai(h5aiOptions, h5aiLangs);
                this.pathCache = new this.factory.PathCache();
                this.connector = new this.factory.Connector();
                this.html = new this.factory.Html();
                this.extended = new this.factory.Extended();

                this.extended.init();
                this.connector.init();
                this.h5ai.init();

                $.h5ai = {
                    click: $.proxy(this.h5ai.pathClick, this.h5ai)
                };
            }
        };

    // @include "inc/H5ai.js"
    // @include "inc/Path.js"
    // @include "inc/PathCache.js"
    // @include "inc/Connector.js"
    // @include "inc/Html.js"
    // @include "inc/Extended.js"

    $(function () {

        H5aiJs.init();
    });

}(jQuery));
