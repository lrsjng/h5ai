/*global $, Objects */

Objects.Path = function (pathCache, folder, tableRow) {

    var path,
        checkedDecodeUri = function (uri) {

            try { return decodeURI(uri); } catch (err) {}
            return uri;
        },
        isEmpty = function () {

            return !path.content || $.isEmptyObject(path.content);
        },
        onClick = function (context) {

            h5ai.triggerPathClick(path, context);
        },
        updateHtml = function () {

            path.updateCrumbHtml();
            path.updateExtendedHtml();
            path.updateTreeHtml();
        },
        updateCrumbHtml = function () {

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

            $a = $("<a><img src='/h5ai/images/crumb.png' alt='>' />" + path.label + "</a>")
                    .appendTo($html)
                    .attr("href", path.absHref)
                    .click(function() { onClick("crumb"); });

            if (path.isDomain) {
                $html.addClass("domain");
                $a.find("img").attr("src", "/h5ai/images/home.png");
            }

            if (path.isCurrentFolder) {
                $html.addClass("current");
            }

            if (!isNaN(path.status)) {
                if (path.status === 200) {
                    $("<img class='hint' src='/h5ai/images/page.png' alt='not listable' />").appendTo($a);
                } else {
                    $("<span class='hint'>(" + path.status + ")</span>").appendTo($a);
                }
            }

            if (path.html.$crumb) {
                path.html.$cpathreplaceWith($html);
            }
            path.html.$crumb = $html;

            return $html;
        },
        updateExtendedHtml = function () {

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
                    .click(function() { onClick("extended"); })
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
                if (!h5ai.settings.setParentFolderLabels) {
                    $label.addClass("l10n-parentDirectory");
                }
                $html.addClass("folder-parent");
            }

            if (!isNaN(path.status)) {
                if (path.status === 200) {
                    $html.addClass("page");
                    $a.find(".icon.small img").attr("src", "/h5ai/icons/16x16/folder-page.png");
                    $a.find(".icon.big img").attr("src", "/h5ai/icons/48x48/folder-page.png");
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
        updateTreeHtml = function () {

            var $html, $blank, $a, $indicator, $ul, idx;

            $html = $("<div class='entry' />")
                        .data("path", path)
                        .addClass(path.isFolder ? "folder" : "file");

            $blank = $("<span class='blank' />").appendTo($html);

            $a = $("<a />")
                    .attr("href", path.absHref)
                    .click(function() { path.onClick("tree"); })
                    .appendTo($html)
                    .append($("<span class='icon'><img src='" + path.icon16 + "' /></span>"))
                    .append($("<span class='label'>" + path.label + "</span>"));

            if (path.isFolder) {
                // indicator
                if (path.status === undefined || !path.isEmpty()) {
                    $indicator = $("<span class='indicator'><img src='/h5ai/images/tree.png' /></span>");
                    if (path.status === undefined) {
                        $indicator.addClass("unknown");
                    } else if (path.treeOpen) {
                        $indicator.addClass("open");
                    }

                    $indicator.click(function(event) {

                        if ($indicator.hasClass("unknown")) {
                            tree.fetchStatusAndContent(path.absHref, false, function (status, content) {

                                path.status = status;
                                path.content = content;
                                path.treeOpen = true;
                                $("#tree").get(0).updateScrollbar(true);
                                path.updateTreeHtml(function() {

                                    $("#tree").get(0).updateScrollbar();
                                });
                            });
                        } else if ($indicator.hasClass("open")) {
                            path.treeOpen = false;
                            $indicator.removeClass("open");
                            $("#tree").get(0).updateScrollbar(true);
                            $html.find("> ul.content").slideUp(function() {

                                $("#tree").get(0).updateScrollbar();
                            });
                        } else {
                            path.treeOpen = true;
                            $indicator.addClass("open");
                            $("#tree").get(0).updateScrollbar(true);
                            $html.find("> ul.content").slideDown(function() {

                                $("#tree").get(0).updateScrollbar();
                            });
                        }
                    });
                    $html.addClass("initiatedIndicator");

                    $blank.replaceWith($indicator);
                }
               
                // is path the domain?
                if (path.isDomain) {
                    $html.addClass("domain");
                    $a.find(".icon img").attr("src", "/h5ai/icons/16x16/folder-home.png");
                }

                // is path the current folder?
                if (path.isCurrentFolder) {
                    $html.addClass("current");
                    $a.find(".icon img").attr("src", "/h5ai/icons/16x16/folder-open.png");
                }

                // does it have subfolders?
                if (!path.isEmpty()) {
                    $ul = $("<ul class='content' />").appendTo($html);
                    $.each(path.content, function (idx, entry) {
                        $("<li />").append(entry.updateTreeHtml()).appendTo($ul);
                    });
                    if (path.status === undefined || !path.treeOpen) {
                        $ul.hide();
                    }
                }

                // reflect folder status
                if (!isNaN(path.status)) {
                    if (path.status === 200) {
                        $a.find(".icon img").attr("src", "/h5ai/icons/16x16/folder-page.png");
                        $a.append($("<span class='hint'><img src='/h5ai/images/page.png' /></span>"));
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
        init = function () {

            var $tds, $img, $a, splits;

            path = {
                // parentFolder: undefined,
                // label: undefined,
                // date: undefined,
                // size: undefined,
                // href: undefined,
                // absHref: undefined,
                // alt: undefined,
                // icon16: undefined,
                // icon48: undefined,
                // isFolder: undefined,
                // isParentFolder: undefined,
                // isCurrentFolder: undefined,
                // isDomain: undefined,

                status: undefined,  // undefined, "h5ai" or HTTP response code
                content: undefined,  // associative array path.absHref -> path
                html: {
                    $crumb: undefined,
                    $extended: undefined,
                    $tree: undefined
                },
                treeOpen: false,

                isEmpty: isEmpty,
                onClick: onClick,
                updateHtml: updateHtml,
                updateCrumbHtml: updateCrumbHtml,
                updateExtendedHtml: updateExtendedHtml,
                updateTreeHtml: updateTreeHtml
            };

            if (!pathCache.pathEndsWithSlash(folder)) {
                folder += "/";
            }

            if (tableRow) {
                $tds = $(tableRow).find("td");
                $img = $tds.eq(0).find("img");
                $a = $tds.eq(1).find("a");

                path.parentFolder = folder;
                path.label = $a.text();
                path.date = $tds.eq(2).text();
                path.size = $tds.eq(3).text();
                path.href = $a.attr("href");
                path.alt = $img.attr("alt");
                path.icon16 = $img.attr("src");
            } else {
                splits = pathCache.splitPathname(folder);

                path.parentFolder = splits[0];
                path.label = checkedDecodeUri(splits[1]);
                if (path.label === "/") {
                    path.label = checkedDecodeUri(document.domain) + "/";
                }
                path.date = "";
                path.size = "";
                path.href = splits[1];
                path.alt = "[DIR]";
                path.icon16 = "/h5ai/icons/16x16/folder.png";
            }

            if (pathCache.pathEndsWithSlash(path.label)) {
                path.label = path.label.slice(0, -1);
            }

            path.icon48 = path.icon16.replace("16x16", "48x48");
            path.isFolder = (path.alt === "[DIR]");
            path.isParentFolder = (path.isFolder && path.label === "Parent Directory");
            path.absHref = path.isParentFolder ? path.href : path.parentFolder + path.href;
            path.isCurrentFolder = (path.absHref === document.location.pathname);
            path.isDomain = (path.absHref === "/");

            if (path.isParentFolder && h5ai.settings.setParentFolderLabels) {
                if (path.isDomain) {
                    path.label = checkedDecodeUri(document.domain);
                } else {
                    path.label = checkedDecodeUri(pathCache.splitPathname(pathCache.splitPathname(path.parentFolder)[0])[1].slice(0, -1));
                }
            }
        };

    init();

    return path;
};


Objects.PathCache = function () {

    var pathCache,
        cache = {},
        rePathnameSplit = /^(\/(.*\/)*)([^\/]+\/?)$/,
        rePathEndsWithSlash = /\/$/,
        splitPathname = function (pathname) {

            var match;

            if (pathname === "/") {
                return ["", "/"];
            }
            match = rePathnameSplit.exec(pathname);
            return [match[1], match[3]];
        },
        pathEndsWithSlash = function (pathname) {

            return rePathEndsWithSlash.test(pathname);
        },
        getAbsHref = function (folder, tableRow) {

            var $a, isParentFolder, href;

            if (!pathEndsWithSlash(folder)) {
                folder += "/";
            }
            if (!tableRow) {
                return folder;
            }
            $a = $(tableRow).find("td").eq(1).find("a");
            isParentFolder = ($a.text() === "Parent Directory");
            href = $a.attr("href");
            return isParentFolder ? undefined : folder + href;
        },
        getPath = function (folder, tableRow) {

            var absHref = getAbsHref(folder, tableRow),
                path = cache[absHref];

            if (!path) {
                path = new Objects.Path(pathCache, folder, tableRow);
                if (!path.isParentFolder) {
                    cache[path.absHref] = path;
                }
            }

            return path;
        };

    pathCache = {
        splitPathname: splitPathname,
        pathEndsWithSlash: pathEndsWithSlash,
        getPath: getPath,
        cache: cache
    };

    return pathCache;
};
