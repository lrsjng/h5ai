
(function($) {
    "use strict";

    var H5aiJs = {
            factory: {},
            init: function () {

                this.h5ai = new this.factory.H5ai(h5aiOptions, h5aiLangs);

                this.h5ai.init();
                $("#tree").scrollpanel();
                this.h5ai.shiftTree(false, true);

                $.h5ai = {
                    click: $.proxy(this.h5ai.pathClick, this.h5ai)
                };
            }
        };

    // @include "inc/H5ai.js"

    $(function () {

        H5aiJs.init();
    });

}(jQuery));
