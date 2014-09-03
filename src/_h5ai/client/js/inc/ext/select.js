modulejs.define('ext/select', ['_', '$', 'core/settings', 'core/resource', 'core/event'], function (_, $, allsettings, resource, event) {

    var settings = _.extend({
            enabled: false,
            checkboxes: false
        }, allsettings.select);
    var template = '<span class="selector"><img src="' + resource.image('selected') + '" alt="selected"/></span>';
    var x = 0, y = 0;
    var l = 0, t = 0, w = 0, h = 0;
    var shrink = 1/3;
    var $document = $(document);
    var $selectionRect = $('<div id="selection-rect"/>');


    function publish() {

        var items = _.map($('#items .item.selected'), function (itemElement) {

                return $(itemElement).data('item');
            });

        event.pub('selection', items);
    }

    function elementRect($element) {

        if (!$element.is(':visible')) {
            return null;
        }

        var offset = $element.offset();
        var l = offset.left;
        var t = offset.top;
        var w = $element.outerWidth();
        var h = $element.outerHeight();
        return {l: l, t: t, w: w, h: h, r: l + w, b: t + h};
    }

    function doOverlap(rect1, rect2) {

        if (!rect1 || !rect2) {
            return false;
        }

        var left = Math.max(rect1.l, rect2.l);
        var right = Math.min(rect1.r, rect2.r);
        var top = Math.max(rect1.t, rect2.t);
        var bottom = Math.min(rect1.b, rect2.b);
        var width = right - left;
        var height = bottom - top;

        return (width >= 0 && height >= 0);
    }

    function selectionUpdate(ev) {

        l = Math.min(x, ev.pageX);
        t = Math.min(y, ev.pageY);
        w = Math.abs(x - ev.pageX);
        h = Math.abs(y - ev.pageY);

        ev.preventDefault();
        $selectionRect
            .stop(true, true)
            .css({left: l, top: t, width: w, height: h, opacity: 1})
            .show();

        var selRect = elementRect($selectionRect);
        $('#items .item').removeClass('selecting').each(function () {

            var $item = $(this);
            var inter = doOverlap(selRect, elementRect($item.find('a')));

            if (inter && !$item.hasClass('folder-parent')) {
                $item.addClass('selecting');
            }
        });
    }

    function selectionEnd(event) {

        event.preventDefault();
        $document.off('mousemove', selectionUpdate);
        $('#items .item.selecting.selected').removeClass('selecting').removeClass('selected');
        $('#items .item.selecting').removeClass('selecting').addClass('selected');
        publish();

        $selectionRect
            .stop(true, true)
            .animate(
                {
                    left: l + w * 0.5 * shrink,
                    top: t + h * 0.5 * shrink,
                    width: w * (1 - shrink),
                    height: h * (1 - shrink),
                    opacity: 0
                },
                300,
                function () {
                    $selectionRect.hide();
                }
            );
    }

    function selectionStart(event) {

        var $window = $(window);
        var viewRight = $window.scrollLeft() + $window.width();
        var viewBottom = $window.scrollTop() + $window.height();

        x = event.pageX;
        y = event.pageY;

        // only on left button and don't block the scrollbars
        if (event.button !== 0 || x >= viewRight || y >= viewBottom) {
            return;
        }

        $(':focus').blur();
        if (!event.ctrlKey && !event.metaKey) {
            $('#items .item').removeClass('selected');
            publish();
        }

        $document
            .on('mousemove', selectionUpdate)
            .one('mouseup', selectionEnd);

        selectionUpdate(event);
    }

    function noSelection(event) {

        event.stopImmediatePropagation();
        return false;
    }

    function noSelectionUnlessCtrl(event) {

        if (!event.ctrlKey && !event.metaKey) {
            noSelection(event);
        }
    }

    function initItem(item) {

        if (item.$view) {
            $(template)
                .appendTo(item.$view.find('a'))
                .on('click', function (event) {

                    event.stopImmediatePropagation();
                    event.preventDefault();

                    item.$view.toggleClass('selected');
                    publish();
                });
        }
    }

    function onLocationChanged(item) {

        if (settings.checkboxes) {
            _.each(item.content, initItem);
        }
        publish();
    }

    function onLocationRefreshed(item, added, removed) {

        var selectionChanged = false;

        if (settings.checkboxes) {
            _.each(added, initItem);
        }
        _.each(removed, function (item) {

            if (item.$view && item.$view.hasClass('selected')) {
                item.$view.removeClass('selected');
                selectionChanged = true;
            }
        });

        if (selectionChanged) {
            publish();
        }
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $selectionRect.hide().appendTo('body');

        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationRefreshed);

        $document
            .on('mousedown', '.noSelection', noSelection)
            .on('mousedown', '.noSelectionUnlessCtrl,input,select,a', noSelectionUnlessCtrl)
            .on('mousedown', selectionStart);
    }


    init();
});
