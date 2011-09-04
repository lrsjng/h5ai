(function ($) {

    var init = function (htmlElement) {

        var $element = $(htmlElement),
            $scrollbar, $drag, $wrapper, $content, mouseOffsetY, updateId,
            update, scroll;

        if (!$element.css("position") || $element.css("position") === "static") {
            $element.css("position", "relative");
        }

        $scrollbar = $("<div class='scrollbar' />");
        $drag = $("<div class='drag' />").appendTo($scrollbar);
        $element
            .wrapInner("<div class='wrapper'><div class='content' /></div>")
            .append($scrollbar);
        $wrapper = $element.find("> .wrapper");
        $content = $wrapper.find("> .content");
        mouseOffsetY = 0;

        update = function (repeat) {

            var visibleHeight, contentHeight, scrollTop, scrollTopFrac, visVertFrac;

            if (updateId && !repeat) {
                clearInterval(updateId);
                updateId = undefined;
            } else if (!updateId && repeat) {
                updateId = setInterval(function() { update(true); }, 50);
            }

            $wrapper.css("height", $element.height());
            visibleHeight = $element.height();
            contentHeight = $content.outerHeight();
            scrollTop = $wrapper.scrollTop();
            scrollTopFrac = scrollTop / contentHeight;
            visVertFrac = Math.min(visibleHeight / contentHeight, 1);

            if (visVertFrac < 1) {
                $scrollbar
                    .fadeIn(50)
                    .css({
                        height: $element.innerHeight() + $scrollbar.height() - $scrollbar.outerHeight(true)
                    });
                $drag
                    .css({
                        top: $scrollbar.height() * scrollTopFrac,
                        height: $scrollbar.height() * visVertFrac
                    });
            } else {
                $scrollbar.fadeOut(50);
            }
        };

        scroll = function (event) {

            var clickFrac = (event.pageY - $scrollbar.offset().top - mouseOffsetY) / $scrollbar.height();

            $wrapper.scrollTop($content.outerHeight() * clickFrac);
            update();
            event.preventDefault();
        };

        $element
            .mousewheel(function (event, delta) {

                $wrapper.scrollTop($wrapper.scrollTop() - 50 * delta);
                update();
                event.stopPropagation();
                event.preventDefault();
            })
            .scroll(update);
        $element.get(0).updateScrollbar = update;
        $wrapper
            .css({
                "padding-right": $scrollbar.outerWidth(true),
                height: $element.height(),
                overflow: "hidden"
            });
        $scrollbar
            .css({
                position: "absolute",
                top: 0,
                right: 0,
                overflow: "hidden",
                cursor: "pointer"
            })
            .mousedown(function (event) {

                mouseOffsetY = $drag.outerHeight() / 2;
                scroll(event);
                $scrollbar.addClass("dragOn");
                $(window)
                    .bind("mousemove", scroll)
                    .one("mouseup", function (event) {

                        $scrollbar.removeClass("dragOn");
                        $(window).unbind("mousemove", scroll);
                        scroll(event);
                        event.stopPropagation();
                    });
                event.preventDefault();
            })
            .each(function () {

                this.onselectstart = function () {

                    return false;
                };
            });
        $drag
            .css({
                position: "absolute",
                left: 0,
                width: "100%"
            })
            .mousedown(function (event) {

                mouseOffsetY = event.pageY - $drag.offset().top;
                scroll(event);
                $scrollbar.addClass("dragOn");
                $(window)
                    .bind("mousemove", scroll)
                    .one("mouseup", function (event) {

                        $scrollbar.removeClass("dragOn");
                        $(window).unbind("mousemove", scroll);
                        scroll(event);
                        event.stopPropagation();
                    });
                event.stopPropagation();
            });

        update();
    };


    $.fn.scrollpanel = function () {

        return this.each(function () {

            init(this);
        });
    };

})(jQuery);
