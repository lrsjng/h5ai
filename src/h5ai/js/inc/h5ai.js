
var H5ai = function (options, langs) {
    "use strict";
    /*global $, window, localStorage*/

    var defaults = {
            store: {
                viewmode: "h5ai.viewmode",
                lang: "h5ai.lang"
            },
            callbacks: {
                pathClick: []
            },

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

            dateFormat: "Y-m-d H:i",
            ignore: ["h5ai", "h5ai.header.html", "h5ai.footer.html"],
            ignoreRE: ["/^\\./"],
            showThumbs: true
        },
        settings = $.extend({}, defaults, options),
        pathClick = function (fn) {

            if ($.isFunction(fn)) {
                settings.callbacks.pathClick.push(fn);
            }
        },
        triggerPathClick = function (path, context) {

            var i, l, a = settings.callbacks.pathClick;

            for (i = 0, l = a.length; i < l; i++) {
                a[i].call(window, path, context);
            }
        },
        getViewmode = function () {

            var viewmode = localStorage.getItem(settings.store.viewmode);

            return $.inArray(viewmode, settings.viewmodes) >= 0 ? viewmode : settings.viewmodes[0];
        },
        applyViewmode = function (viewmode) {

            if (viewmode) {
                localStorage.setItem(settings.store.viewmode, viewmode);
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

                var winHeight = $(window).height(),
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

            $(window).resize(function () {
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

            if (settings.slideTree && $tree.outerWidth() < $extended.offset().left || forceVisible) {
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
            $(window).resize(function () { shiftTree(); });
            shiftTree(false, true);
        },
        linkHoverStates = function () {

            if (settings.linkHoverStates) {
                $("a[href^='/']:not(.linkedHoverStates)").each(function () {

                    var $a = $(this).addClass("linkedHoverStates"),
                        href = $a.attr("href");

                    $a.hover(
                        function () { $("a[href='" + href + "']").addClass("hover"); },
                        function () { $("a[href='" + href + "']").removeClass("hover"); }
                );
                });
            }
        },
        localize = function (langs, lang, useBrowserLang) {

            var storedLang = localStorage.getItem(settings.store.lang),
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
                for (key in selected) {
                    $(".l10n-" + key).text(selected[key]);
                }
                $(".lang").text(lang);
                $(".langOption").removeClass("current");
                $(".langOption." + lang).addClass("current");
            }
        },
        initLangSelector = function (langs) {

            var idx, lang,
                sortedLangsKeys = [],
                $ul;

            for (lang in langs) {
                sortedLangsKeys.push(lang);
            }
            sortedLangsKeys.sort();

            $ul = $("<ul />");
            for (idx in sortedLangsKeys) {
                (function (lang) {
                    $("<li class='langOption' />")
                        .addClass(lang)
                        .text(lang + " - " + langs[lang].lang)
                        .appendTo($ul)
                        .click(function () {
                            localStorage.setItem(settings.store.lang, lang);
                            localize(langs, lang, false);
                        });
                })(sortedLangsKeys[idx]);
            }
            $("#langSelector .langOptions").append($ul);
            $("#langSelector").hover(
                function () {
                    var $ele = $(".langOptions");
                    $ele.css("top", "-" + $ele.outerHeight() + "px").stop(true, true).fadeIn();
                },
                function () {
                    $(".langOptions").stop(true, true).fadeOut();
                }
        );
        },
        initIndicators = function () {

            $("#tree .entry.folder:not(.initiatedIndicator)").each(function () {

                var $entry = $(this).addClass("initiatedIndicator"),
                    $indicator = $entry.find("> .indicator");

                $indicator.click(function (event) {

                    var $content;

                    if ($indicator.hasClass("unknown")) {
                        $.get("/h5ai/php/treecontent.php", { "href": $entry.find("> a").attr("href") }, function (html) {
                            $content = $(html);
                            $indicator.removeClass("unknown");
                            if ($content.find("> li").size() === 0) {
                                $indicator.replaceWith($("<span class='blank' />"));
                            } else {
                                $indicator.addClass("open");
                                $entry.find("> .content").replaceWith($content);
                                $("#tree").get(0).updateScrollbar();
                                initIndicators();
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
                });
            });
        },
        initSelect = function () {

            var x = 0,
                y = 0,
                $window = $(window),
                selected = function (hrefs) {

                    var query, idx;
                    for (idx in hrefs) {
                        query = query ? query + ":" + hrefs[idx] : hrefs[idx];
                    }
                    query = "/h5ai/php/zipcontent.php?hrefs=" + query;
                    $("#download").show().find("a").attr("href", query);
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
                    $("#extended a").removeClass("selected").each(function () {

                        var $a = $(this),
                            rect = $a.fracs("rect"),
                            inter = sel.intersection(rect);
                        if (inter && !$a.closest(".entry").hasClass("folder-parent")) {
                            $a.addClass("selected");
                        }
                    });
                },
                selectionEnd = function (event) {

                    event.preventDefault();
                    $("#selection-rect").hide().css({left: 0, top: 0, width: 0, height: 0});

                    $window.unbind("mousemove", selectionUpdate);

                    var hrefs = [];
                    $("#extended a.selected").each(function () {
                        hrefs.push($(this).attr("href"));
                    });
                    if (hrefs.length > 0) {
                        selected(hrefs);
                    }
                },
                selectionStart = function (event) {

                    event.preventDefault();
                    x = event.pageX;
                    y = event.pageY;
                    $("#download").hide().find("a").attr("href", "#");
                    $("#extended a").removeClass("selected");
                    $("#selection-rect").show().css({left: x, top: y, width: 0, height: 0});

                    $window
                        .bind("mousemove", selectionUpdate)
                        .one("mouseup", selectionEnd);
                },
                noSelection = function (event) {

                    event.stopPropagation();
                    return false;
                };

            $("body>nav,body>footer,#tree,#extended a").bind("mousedown", noSelection);
            $("#extended a").live("mousedown", noSelection);
            $window.bind("mousedown", selectionStart);
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
            initSelect();
        },
        h5ai = {
            settings: settings,
            shiftTree: shiftTree,
            linkHoverStates: linkHoverStates,
            pathClick: pathClick,
            triggerPathClick: triggerPathClick,
            init: init
        };

    return h5ai;
};
