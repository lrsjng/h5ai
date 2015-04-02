modulejs.define('ext/select', ['_', '$', 'core/settings', 'core/resource', 'core/event'], function (_, $, allsettings, resource, event) {

    var settings = _.extend({
            enabled: false,
            clickndrag: false,
            checkboxes: false
        }, allsettings.select);
    var template = '<span class="selector"><img src="' + resource.image('selected') + '" alt="selected"/></span>';
    var x = 0, y = 0;
    var l = 0, t = 0, w = 0, h = 0;
    var isDragSelect, isCtrlPressed;
    var shrink = 1/3;
    var $document = $(document);
    var $html = $('html');
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

        if (!isDragSelect && w < 4 && h < 4) {
            return;
        }

        if (!isDragSelect && !isCtrlPressed) {
            $('#items .item').removeClass('selected');
            publish();
        }

        isDragSelect = true;
        $html.addClass('drag-select');

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

    function selectionEnd(ev) {

        $document.off('mousemove', selectionUpdate);

        if (!isDragSelect) {
            return;
        }

        ev.preventDefault();
        $('#items .item.selecting.selected').removeClass('selecting').removeClass('selected');
        $('#items .item.selecting').removeClass('selecting').addClass('selected');
        publish();

        $html.removeClass('drag-select');
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

    function selectionStart(ev) {

        // only on left button and don't block scrollbar
        if (ev.button !== 0 || ev.offsetX >= $('#content').width() - 14) {
            return;
        }

        isDragSelect = false;
        isCtrlPressed = ev.ctrlKey || ev.metaKey;
        x = ev.pageX;
        y = ev.pageY;

        $document
            .on('mousemove', selectionUpdate)
            .one('mouseup', selectionEnd);
    }

    function initItem(item) {

        if (item.$view) {
            $(template)
                .appendTo(item.$view.find('a'))
                .on('click', function (ev) {

                    ev.stopImmediatePropagation();
                    ev.preventDefault();

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

        if (!settings.enabled || (!settings.clickndrag && !settings.checkboxes)) {
            return;
        }

        event.sub('location.changed', onLocationChanged);
        event.sub('location.refreshed', onLocationRefreshed);

        if (settings.clickndrag) {
            $selectionRect.hide().appendTo('body');

            $('#content')
                .on('mousedown', selectionStart)
                .on('drag dragstart', function (ev) {

                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                })
                .on('click', function (ev) {

                    $('#items .item').removeClass('selected');
                    publish();
                });
        }
    }


    init();
});
