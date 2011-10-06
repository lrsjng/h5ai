/*global window, jQuery */

(function ($) {
    "use strict";

    // http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
    // modified
    $.log = function () {

        $.log.history = $.log.history || [];
        $.log.history.push(arguments);
        if (window.console) {
            window.console.log(Array.prototype.slice.call(arguments));
        }
    };

    $.timer = (function () {

        var start = $.now(),
            last = start;

        return {
            log: function (label) {
                var now = $.now();
                $.log("timer", label, "+" + (now - last), "=" + (now - start));
                last = now;
            }
        };
    }());

}(jQuery));
