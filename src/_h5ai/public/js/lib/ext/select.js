modulejs.define('ext/select', ['_', '$', 'core/event', 'core/resource', 'core/settings'], function (_, $, event, resource, allsettings) {
    var settings = _.extend({
        enabled: false,
        clickndrag: false,
        checkboxes: false
    }, allsettings.select);
    var template = '<span class="selector"><img src="' + resource.image('selected') + '" alt="selected"/></span>';
    var x = 0;
    var y = 0;
    var l = 0;
    var t = 0;
    var w = 0;
    var h = 0;
    var isDragSelect;
    var isCtrlPressed;
    var shrink = 1 / 3;
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
        var elL = offset.left;
        var elT = offset.top;
        var elW = $element.outerWidth();
        var elH = $element.outerHeight();
        return {l: elL, t: elT, w: elW, h: elH, r: elL + elW, b: elT + elH};
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

        return width >= 0 && height >= 0;
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
            .animate({
                left: l + w * 0.5 * shrink,
                top: t + h * 0.5 * shrink,
                width: w * (1 - shrink),
                height: h * (1 - shrink),
                opacity: 0
            },
            300,
            function () {
                $selectionRect.hide();
            });
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

    function onSelectorClick(ev) {
        ev.stopImmediatePropagation();
        ev.preventDefault();

        $(ev.target).closest('.item').toggleClass('selected');
        publish();
    }

    function addCheckbox(item) {
        if (item.$view && !item.isCurrentParentFolder()) {
            $(template)
                .on('click', onSelectorClick)
                .appendTo(item.$view.find('a'));
        }
    }

    function onViewChanged(added, removed) {
        if (settings.checkboxes) {
            _.each(added, addCheckbox);
        }

        _.each(removed, function (item) {
            if (item.$view) {
                item.$view.removeClass('selected');
            }
        });

        publish();
    }

    function init() {
        if (!settings.enabled || !settings.clickndrag && !settings.checkboxes) {
            return;
        }

        event.sub('view.changed', onViewChanged);

        if (settings.clickndrag) {
            $selectionRect.hide().appendTo('body');

            $('#content')
                .on('mousedown', selectionStart)
                .on('drag dragstart', function (ev) {
                    ev.stopImmediatePropagation();
                    ev.preventDefault();
                })
                .on('click', function () {
                    $('#items .item').removeClass('selected');
                    publish();
                });
        }
    }


    init();
});
