
H5aiJs.factory.H5ai = function (options, langs) {
    /*global window, $, amplify*/

    var $window = $(window),
        $document = $(document),
        defaults = {
            store: {
                viewmode: "h5ai.pref.viewmode",
                lang: "h5ai.pref.lang"
            },
            callbacks: {
                pathClick: []
            },

            h5aiAbsHref: "/h5ai",
            viewmodes: ["details", "icons"],
            sortorder: {
                column: "name",
                ascending: true
            },
            showTree: true,
            slideTree: true,
            folderStatus: {},
            lang: null,
            useBrowserLang: true,
            setParentFolderLabels: true,
            linkHoverStates: true,
            dateFormat: "yyyy-MM-dd HH:mm",
            showThumbs: true,
            zippedDownload: true
        },
        settings = $.extend({}, defaults, options),
        api = function () {
            return settings.h5aiAbsHref + "/php/api.php";
        },
        image = function (id) {

            return settings.h5aiAbsHref + "/images/" + id + ".png";
        },
        icon = function (id, big) {

            return settings.h5aiAbsHref + "/icons/" + (big ? "48x48" : "16x16") + "/" + id + ".png";
        },
        pathClick = function (fn) {

            if ($.isFunction(fn)) {
                settings.callbacks.pathClick.push(fn);
            }
        },
        triggerPathClick = function (path, context) {

            $.each(settings.callbacks.pathClick, function (idx, callback) {
                callback(path, context);
            });
        },
        getViewmode = function () {

            var viewmode = amplify.store(settings.store.viewmode);

            return $.inArray(viewmode, settings.viewmodes) >= 0 ? viewmode : settings.viewmodes[0];
        },
        applyViewmode = function (viewmode) {

            if (viewmode) {
                amplify.store(settings.store.viewmode, viewmode);
            }
            viewmode = getViewmode();

            $("#viewdetails,#viewicons").hide().removeClass("current");

            if (settings.viewmodes.length > 1) {
                if ($.inArray("details", settings.viewmodes) >= 0) {
                    $("#viewdetails").show();
                }
                if ($.inArray("icons", settings.viewmodes) >= 0) {
                    $("#viewicons").show();
                }
            }

            if (viewmode === "details") {
                $("#viewdetails").closest("li").addClass("current");
                $("#extended").addClass("details-view").removeClass("icons-view").show();
            } else if (viewmode === "icons") {
                $("#viewicons").closest("li").addClass("current");
                $("#extended").removeClass("details-view").addClass("icons-view").show();
            } else {
                $("#extended").hide();
            }
        },
        initTopSpace = function () {

            var adjustTopSpace = function () {

                var winHeight = $window.height(),
                    navHeight = $("body > nav").outerHeight(),
                    footerHeight = $("body > footer").outerHeight(),
                    contentSpacing = 50,
                    treeSpacing = 50;

                $("body").css({
                    "margin-top": navHeight + contentSpacing,
                    "margin-bottom": footerHeight + contentSpacing
                });

                $("#tree").css({
                    top: navHeight + treeSpacing,
                    height: winHeight - navHeight - footerHeight - 36 - 2 * treeSpacing
                });

                try {
                    $("#tree").get(0).updateScrollbar();
                } catch (err) {}
            };

            $window.resize(function () {
                adjustTopSpace();
            });
            adjustTopSpace();
        },
        initViews = function () {

            $("#table").remove();

            $("#viewdetails").closest("li")
                .click(function () { applyViewmode("details"); });
            $("#viewicons").closest("li")
                .click(function () { applyViewmode("icons"); });

            // status update
            $("#extended .entry a").hover(
                function () {
                    if ($("#extended").hasClass("icons-view")) {
                        var $this = $(this);
                        $(".status.default").hide();
                        $(".status.dynamic")
                            .empty()
                            .append($this.find(".label").clone())
                            .append($("<span class='sep'>·</span>"))
                            .append($this.find(".date").clone())
                            .show();

                        if (!$this.closest(".entry").hasClass("folder")) {
                            $(".status.dynamic")
                                .append($("<span class='sep'>·</span>"))
                                .append($this.find(".size").clone());
                        }
                    }
                },
                function () {
                    $(".status.default").show();
                    $(".status.dynamic").empty().hide();
                }
            );
        },
        shiftTree = function (forceVisible, dontAnimate) {

            var $tree = $("#tree"),
                $extended = $("#extended");

            if ((settings.slideTree && $tree.outerWidth() < $extended.offset().left) || forceVisible) {
                if (dontAnimate) {
                    $tree.stop().css({ left: 0 });
                } else {
                    $tree.stop().animate({ left: 0 });
                }
            } else {
                if (dontAnimate) {
                    $tree.stop().css({ left: 18 - $tree.outerWidth() });
                } else {
                    $tree.stop().animate({ left: 18 - $tree.outerWidth() });
                }
            }
        },
        initTree = function () {

            $("#tree").hover(
                function () { shiftTree(true); },
                function () { shiftTree(); }
            );
            $window.resize(function () { shiftTree(); });
            shiftTree(false, true);
        },
        selectLinks = function (href) {

            var elements = [];
            $("a[href^='/']").each(function () {

                if ($(this).attr("href") === href) {
                    elements.push(this);
                }
            });
            return $(elements);
        },
        linkHoverStates = function () {

            if (settings.linkHoverStates) {
                $("a[href^='/']:not(.linkedHoverStates)").each(function () {

                    var $a = $(this).addClass("linkedHoverStates"),
                        href = $a.attr("href");

                    $a.hover(
                        function () { selectLinks(href).addClass("hover"); },
                        function () { selectLinks(href).removeClass("hover"); }
                    );
                });
            }
        },
        localize = function (langs, lang, useBrowserLang) {

            var storedLang = amplify.store(settings.store.lang),
                dateFormat = settings.dateFormat,
                browserLang, selected, key;

            if (langs[storedLang]) {
                lang = storedLang;
            } else if (useBrowserLang) {
                browserLang = navigator.language;
                if (langs[browserLang]) {
                    lang = browserLang;
                } else if (browserLang.length > 2 && langs[browserLang.substr(0, 2)]) {
                    lang = browserLang.substr(0, 2);
                }
            }

            if (!langs[lang]) {
                lang = "en";
            }

            selected = langs[lang];
            if (selected) {
                $.each(selected, function (key, value) {
                    $(".l10n-" + key).text(value);
                });
                $(".lang").text(lang);
                $(".langOption").removeClass("current");
                $(".langOption." + lang).addClass("current");
            }

            dateFormat = selected.dateFormat || dateFormat;
            $("#extended .entry .date").each(function () {

                var $this = $(this),
                    time = $this.data("time"),
                    formattedDate = time ? new Date(time).toString(dateFormat) : "";

                $this.text(formattedDate);
            });

        },
        initLangSelector = function (langs) {

            var $langOptions = $(".langOptions"),
                sortedLangsKeys = [],
                $ul;

            $.each(langs, function (lang) {
                sortedLangsKeys.push(lang);
            });
            sortedLangsKeys.sort();

            $ul = $("<ul />");
            $.each(sortedLangsKeys, function (idx, lang) {
                $("<li class='langOption' />")
                    .addClass(lang)
                    .text(lang + " - " + langs[lang].lang)
                    .appendTo($ul)
                    .click(function () {
                        amplify.store(settings.store.lang, lang);
                        localize(langs, lang, false);
                    });
            });
            $("#langSelector .langOptions").append($ul);
            $("#langSelector").hover(
                function () {
                    $langOptions
                        .css("top", "-" + $langOptions.outerHeight() + "px")
                        .stop(true, true)
                        .fadeIn();
                },
                function () {
                    $langOptions
                        .stop(true, true)
                        .fadeOut();
                }
            );
        },
        onIndicatorClick = function (event) {

            var $indicator = $(this),
                $entry = $indicator.closest(".entry");

            if ($indicator.hasClass("unknown")) {
                $.get(api(), { "action": "tree", "href": $entry.find("> a").attr("href") }, function (html) {

                    var $content = $(html);

                    $indicator.removeClass("unknown");
                    if ($content.find("> li").size() === 0) {
                        $indicator.replaceWith($("<span class='blank' />"));
                    } else {
                        $indicator.addClass("open");
                        $entry.find("> .content").replaceWith($content);
                        $("#tree").get(0).updateScrollbar();
                        $content.find(".indicator:not(.initiated)")
                            .click(onIndicatorClick)
                            .addClass("initiated");
                    }
                });
            } else if ($indicator.hasClass("open")) {
                $indicator.removeClass("open");
                $("#tree").get(0).updateScrollbar(true);
                $entry.find("> .content").slideUp(function () {
                    $("#tree").get(0).updateScrollbar();
                });
            } else {
                $indicator.addClass("open");
                $("#tree").get(0).updateScrollbar(true);
                $entry.find("> .content").slideDown(function () {
                    $("#tree").get(0).updateScrollbar();
                });
            }
        },
        initIndicators = function () {

            $("#tree .entry.folder .indicator:not(.initiated)")
                .click(onIndicatorClick)
                .addClass("initiated");
        },
        initZippedDownload = function () {

            var x = 0,
                y = 0,
                ctrl = false,
                updateDownloadBtn = function () {

                    var query,
                        href,
                        $selected = $("#extended a.selected");

                    if ($selected.size() > 0) {
                        $selected.each(function () {
                            href = $(this).attr("href");
                            query = query ? query + ":" + href : href;
                        });
                        query = api() + "?action=zip&hrefs=" + query;
                        $("#download").show().find("a").attr("href", query);
                    } else {
                        $("#download").hide().find("a").attr("href", "#");
                    }
                },
                selectionUpdate = function (event) {

                    var l = Math.min(x, event.pageX),
                        t = Math.min(y, event.pageY),
                        w = Math.abs(x - event.pageX),
                        h = Math.abs(y - event.pageY),
                        sel;

                    event.preventDefault();
                    $("#selection-rect").css({left: l, top: t, width: w, height: h});

                    sel = $("#selection-rect").fracs("rect");
                    $("#extended a").removeClass("selecting").each(function () {

                        var $a = $(this),
                            rect = $a.fracs("rect"),
                            inter = sel.intersection(rect);
                        if (inter && !$a.closest(".entry").hasClass("folder-parent")) {
                            $a.addClass("selecting");
                        }
                    });
                },
                selectionEnd = function (event) {

                    event.preventDefault();
                    $document.unbind("mousemove", selectionUpdate);
                    $("#selection-rect").hide().css({left: 0, top: 0, width: 0, height: 0});
                    $("#extended a.selecting.selected").removeClass("selecting").removeClass("selected");
                    $("#extended a.selecting").removeClass("selecting").addClass("selected");
                    updateDownloadBtn();
                },
                selectionStart = function (event) {

                    var view = $.fracs.viewport();

                    x = event.pageX;
                    y = event.pageY;
                    // only on left button and don't block the scrollbars
                    if (event.button !== 0 || x >= view.right || y >= view.bottom) {
                        return;
                    }

                    event.preventDefault();
                    if (!ctrl) {
                        $("#extended a").removeClass("selected");
                        updateDownloadBtn();
                    }
                    $("#selection-rect").show().css({left: x, top: y, width: 0, height: 0});
                    selectionUpdate(event);

                    $document
                        .bind("mousemove", selectionUpdate)
                        .one("mouseup", selectionEnd);
                },
                noSelection = function (event) {

                    event.stopPropagation();
                    return false;
                },
                noSelectionUnlessCtrl = function (event) {

                    if (!ctrl) {
                        noSelection(event);
                    }
                };

            if (settings.zippedDownload) {
                $("body>nav,body>footer,#tree").bind("mousedown", noSelection);
                $("#extended .entry a").bind("mousedown", noSelectionUnlessCtrl).live("mousedown", noSelectionUnlessCtrl);
                $document
                    .bind("mousedown", selectionStart)
                    .keydown(function (event) {
                        if (event.keyCode === 17) {
                            ctrl = true;
                        }
                    })
                    .keyup(function (event) {
                        if (event.keyCode === 17) {
                            ctrl = false;
                        }
                    });
            }
        },
        init = function () {

            applyViewmode();
            initTopSpace();
            initViews();
            initTree();
            linkHoverStates();
            initLangSelector(langs);
            localize(langs, settings.lang, settings.useBrowserLang);
            initIndicators();
            initZippedDownload();
        };

    return {
        settings: settings,
        api: api,
        image: image,
        icon: icon,
        shiftTree: shiftTree,
        linkHoverStates: linkHoverStates,
        pathClick: pathClick,
        triggerPathClick: triggerPathClick,
        initIndicators: initIndicators,
        init: init
    };
};
