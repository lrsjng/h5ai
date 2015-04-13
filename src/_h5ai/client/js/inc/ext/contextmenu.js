modulejs.define('ext/contextmenu', ['_', '$', 'core/settings', 'core/resource'], function (_, $, allsettings, resource) {

    var settings = _.extend({
            enabled: false
        }, allsettings.contextmenu);
    var templateOverlay = '<div class="cm-overlay"/>';
    var templatePanel = '<div class="cm-panel"><ul/></div>';
    var templateSep = '<li class="cm-sep"/>';
    var templateEntry = '<li class="cm-entry"><span class="cm-icon"><img/></span><span class="cm-text"/></li>';
    var templateLabel = '<li class="cm-label"><span class="cm-text"/></li>';


    function createOverlay(callback) {

        var $overlay = $(templateOverlay);

        $overlay
            .on('click contextmenu', function (ev) {

                ev.stopPropagation();
                ev.preventDefault();

                var cmId = $(ev.target).closest('.cm-entry').data('cm-id');

                if (ev.target === $overlay[0] || cmId !== undefined) {
                    $overlay.remove();
                    callback(cmId);
                }
            });

        return $overlay;
    }

    function createPanel(menu) {

        var $panel = $(templatePanel);
        var $ul = $panel.find('ul');
        var $li;

        _.each(menu, function (entry) {

            if (entry.type === '-') {
                $(templateSep).appendTo($ul);

            } else if (entry.type === 'l') {
                $(templateLabel)
                    .find('.cm-text').text(entry.text).end()
                    .appendTo($ul);

            } else if (entry.type === 'e') {
                $li = $(templateEntry)
                        .data('cm-id', entry.id)
                        .find('.cm-text').text(entry.text).end()
                        .appendTo($ul);

                if (entry.icon) {
                    $li.find('.cm-icon img').attr('src', resource.icon(entry.icon));
                } else {
                    $li.find('.cm-icon').addClass('no-icon');
                }
            }
        });

        return $panel;
    }

    function positionPanel($overlay, $panel, x, y) {

        var margin = 4;

        $panel.css({
            left: 0,
            top: 0,
            opacity: 0
        });
        $overlay.show();

        var overlayOffset = $overlay.offset();
        var overlayLeft = overlayOffset.left;
        var overlayTop = overlayOffset.top;
        var overlayWidth = $overlay.outerWidth(true);
        var overlayHeight = $overlay.outerHeight(true);

        // var panelOffset = $panel.offset();
        // var panelLeft = panelOffset.left;
        // var panelTop = panelOffset.top;
        var panelWidth = $panel.outerWidth(true);
        var panelHeight = $panel.outerHeight(true);

        var posLeft = x;
        var posTop = y;

        if (panelWidth > overlayWidth - 2 * margin) {
            posLeft = margin;
            panelWidth = overlayWidth - 2 * margin;
        }

        if (panelHeight > overlayHeight - 2 * margin) {
            posTop = margin;
            panelHeight = overlayHeight - 2 * margin;
        }

        if (posLeft < overlayLeft + margin) {
            posLeft = overlayLeft + margin;
        }

        if (posLeft + panelWidth > overlayLeft + overlayWidth - margin) {
            posLeft = overlayLeft + overlayWidth - margin - panelWidth;
        }

        if (posTop < overlayTop + margin) {
            posTop = overlayTop + margin;
        }

        if (posTop + panelHeight > overlayTop + overlayHeight - margin) {
            posTop = overlayTop + overlayHeight - margin - panelHeight;
        }

        $panel.css({
            left: posLeft,
            top: posTop,
            width: panelWidth,
            height: panelHeight,
            opacity: 1
        });
    }

    function showMenuAt(x, y, menu, callback) {

        var $overlay = createOverlay(callback);
        var $panel = createPanel(menu);
        $overlay.append($panel).appendTo('body');
        positionPanel($overlay, $panel, x, y);
    }

    function init() {

        if (!settings.enabled) {
            return;
        }

        $(document).on('contextmenu', function (ev) {

            ev.stopPropagation();
            ev.preventDefault();
            $(ev.target).trigger($.Event('h5ai-contextmenu', {
                originalEvent: ev,
                showMenu: function (menu, callback) {

                    showMenuAt(ev.pageX, ev.pageY, menu, callback);
                }
            }));
        });

        // var menu = [
        //         {type: 'e', id: 'e1', text: 'testing context menus'},
        //         {type: 'e', id: 'e2', text: 'another entry'},
        //         {type: 'e', id: 'e3', text: 'one with icon', icon: 'folder'},
        //         {type: '-'},
        //         {type: 'e', id: 'e4', text: 'one with icon', icon: 'x'},
        //         {type: 'e', id: 'e5', text: 'one with icon', icon: 'img'}
        //     ];
        // var callback = function (res) {

        //         window.console.log('>> CB-RESULT >> ' + res);
        //     };

        // $(document).on('h5ai-contextmenu', '#items .item.folder', function (ev) {

        //     window.console.log('CM', ev);
        //     ev.showMenu(menu, callback);
        // });
    }


    init();
});
