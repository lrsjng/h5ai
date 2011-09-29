/*global $, H5aiJs */

H5aiJs.factory.Html = function () {

    var imagesPath = "/h5ai/images",
        iconsPath = "/h5ai/icons",
        image = function (id) {

            return imagesPath + "/" + id + ".png";
        },
        icon = function (id, big) {

            return iconsPath + "/" + (big ? "48x48" : "16x16") + "/" + id + ".png";
        },
        onClick = function (path, context) {

            H5aiJs.h5ai.triggerPathClick(path, context);
        },
        updateCrumbHtml = function (path) {

            var $html, $a;

            if (path.html.$crumb && path.html.$crumb.data("status") === path.status) {
                return path.html.$crumb;
            }

            $html = $("<li class='crumb' />")
                        .data("path", path)
                        .addClass(path.isFolder ? "folder" : "file");

            if (path.status) {
                $html.data("status", path.status);
            }

            $a = $("<a><img src='" + image("crumb") + "' alt='>' />" + path.label + "</a>")
                    .appendTo($html)
                    .attr("href", path.absHref)
                    .click(function() { onClick(path, "crumb"); });

            if (path.isDomain) {
                $html.addClass("domain");
                $a.find("img").attr("src", image("home"));
            }

            if (path.isCurrentFolder) {
                $html.addClass("current");
            }

            if (!isNaN(path.status)) {
                if (path.status === 200) {
                    $("<img class='hint' src='" + image("page") + "' alt='not listable' />").appendTo($a);
                } else {
                    $("<span class='hint'>(" + path.status + ")</span>").appendTo($a);
                }
            }

            if (path.html.$crumb) {
                path.html.$crumb.replaceWith($html);
            }
            path.html.$crumb = $html;

            return $html;
        },
        updateExtendedHtml = function (path) {

            var $html, $a, $label;

            if (path.html.$extended && path.html.$extended.data("status") === path.status) {
                return path.html.$extended;
            }

            $html = $("<li class='entry' />")
                        .data("path", path)
                        .addClass(path.isFolder ? "folder" : "file");

            if (path.status) {
                $html.data("status", path.status);
            }

            $label = $("<span class='label'>" + path.label + "</span>");
            $a = $("<a />")
                    .attr("href", path.absHref)
                    .click(function() { onClick(path, "extended"); })
                    .appendTo($html)
                    .append($("<span class='icon small'><img src='" + path.icon16 + "' alt='" + path.alt + "' /></span>"))
                    .append($("<span class='icon big'><img src='" + path.icon48 + "' alt='" + path.alt + "' /></span>"))
                    .append($label)
                    .append($("<span class='date'>" + path.date + "</span>"))
                    .append($("<span class='size'>" + path.size + "</span>"));

            $a.hover(
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

            if (path.isParentFolder) {
                if (!H5aiJs.h5ai.settings.setParentFolderLabels) {
                    $label.addClass("l10n-parentDirectory");
                }
                $html.addClass("folder-parent");
            }

            if (!isNaN(path.status)) {
                if (path.status === 200) {
                    $html.addClass("page");
                    $a.find(".icon.small img").attr("src", icon("folder-page"));
                    $a.find(".icon.big img").attr("src", icon("folder-page", true));
                } else {
                    $html.addClass("error");
                    $label.append($("<span class='hint'> " + path.status + " </span>"));
                }
            }

            if (path.html.$extended) {
                path.html.$extended.replaceWith($html);
            }
            path.html.$extended = $html;

            return $html;
        },
        updateTreeHtml = function (path) {

            var $html, $blank, $a, $indicator, $ul, idx;

            $html = $("<div class='entry' />")
                        .data("path", path)
                        .addClass(path.isFolder ? "folder" : "file");

            $blank = $("<span class='blank' />").appendTo($html);

            $a = $("<a />")
                    .attr("href", path.absHref)
                    .click(function() { path.onClick(path, "tree"); })
                    .appendTo($html)
                    .append($("<span class='icon'><img src='" + path.icon16 + "' /></span>"))
                    .append($("<span class='label'>" + path.label + "</span>"));

            if (path.isFolder) {
                // indicator
                if (path.status === undefined || !path.isEmpty()) {
                    $indicator = $("<span class='indicator initiated'><img src='" + image("tree") + "' /></span>")
                        .click(function (event) {

                            var $entry = $indicator.closest(".entry"); // $html

                            if ($indicator.hasClass("unknown")) {
                                H5aiJs.connector.fetchStatusAndContent(path.absHref, false, function (status, content) {

                                    path.status = status;
                                    path.content = content;
                                    path.treeOpen = true;
                                    $("#tree").get(0).updateScrollbar(true);
                                    updateTreeHtml(path);
                                    $("#tree").get(0).updateScrollbar();
                                });
                            } else if ($indicator.hasClass("open")) {
                                path.treeOpen = false;
                                $indicator.removeClass("open");
                                $("#tree").get(0).updateScrollbar(true);
                                $entry.find("> ul.content").slideUp(function() {

                                    $("#tree").get(0).updateScrollbar();
                                });
                            } else {
                                path.treeOpen = true;
                                $indicator.addClass("open");
                                $("#tree").get(0).updateScrollbar(true);
                                $entry.find("> ul.content").slideDown(function() {

                                    $("#tree").get(0).updateScrollbar();
                                });
                            }

                        });

                    if (path.status === undefined) {
                        $indicator.addClass("unknown");
                    } else if (path.treeOpen) {
                        $indicator.addClass("open");
                    }

                    $blank.replaceWith($indicator);
                }

                // is path the domain?
                if (path.isDomain) {
                    $html.addClass("domain");
                    $a.find(".icon img").attr("src", icon("folder-home"));
                }

                // is path the current folder?
                if (path.isCurrentFolder) {
                    $html.addClass("current");
                    $a.find(".icon img").attr("src", icon("folder-open"));
                }

                // does it have subfolders?
                if (!path.isEmpty()) {
                    $ul = $("<ul class='content' />").appendTo($html);
                    $.each(path.content, function (idx, entry) {
                        $("<li />").append(updateTreeHtml(entry)).appendTo($ul);
                    });
                    if (path.status === undefined || !path.treeOpen) {
                        $ul.hide();
                    }
                }

                // reflect folder status
                if (!isNaN(path.status)) {
                    if (path.status === 200) {
                        $a.find(".icon img").attr("src", icon("folder-page"));
                        $a.append($("<span class='hint'><img src='" + image("page") + "' /></span>"));
                    } else {
                        $html.addClass("error");
                        $a.append($("<span class='hint'>" + path.status + "</span>"));
                    }
                }
            }

            if (path.html.$tree) {
                path.html.$tree.replaceWith($html);
            }
            path.html.$tree = $html;

            return $html;
        },
        updateHtml = function (path) {

            updateCrumbHtml(path);
            updateExtendedHtml(path);
            updateTreeHtml(path);
        };

    return {
        updateCrumbHtml: updateCrumbHtml,
        updateExtendedHtml: updateExtendedHtml,
        updateTreeHtml: updateTreeHtml,
        updateHtml: updateHtml
    };
};
