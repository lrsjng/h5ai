/*global $, Objects */

Objects.Extended = function (pathCache, h5ai) {

    var settings = {
            customHeader: "h5ai.header.html",
            customFooter: "h5ai.footer.html"
        },
        initTitle = function () {

            document.title = document.domain + document.location.pathname;
            try {
                document.title = decodeURI(document.title);
            } catch (err) {}
        },
        initBreadcrumb = function () {

            var $ul = $("body > nav ul"),
                pathname = "/",
                path = pathCache.getPath(pathname),
                pathnameParts = document.location.pathname.split("/");

            $ul.append(path.updateCrumbHtml());

            $.each(pathnameParts, function (idx, part) {
                if (part !== "") {
                    pathname += part + "/";
                    $ul.append(pathCache.getPath(pathname).updateCrumbHtml());
                }
            });
        },
        initExtendedView = function () {

            var $ths = $("#table th"),
                $label = $ths.eq(1).find("a"),
                $date = $ths.eq(2).find("a"),
                $size = $ths.eq(3).find("a"),
                sortquery = document.location.search,
                order = {
                    column: (sortquery.indexOf("C=N") >= 0) ? "name" : (sortquery.indexOf("C=M") >= 0) ? "date" : (sortquery.indexOf("C=S") >= 0) ? "size" : h5ai.settings.sortorder.column,
                    ascending: (sortquery.indexOf("O=A") >= 0) ? true : (sortquery.indexOf("O=D") >= 0) ? false : h5ai.settings.sortorder.ascending
                },
                $icon, $ul, $li;

            $ul = $("<ul/>");
            $li = $("<li class='header' />")
                    .appendTo($ul)
                    .append($("<a class='icon'></a>"))
                    .append($("<a class='label' href='" + $label.attr("href") + "'><span class='l10n-name'>" + $label.text() + "</span></a>"))
                    .append($("<a class='date' href='" + $date.attr("href") + "'><span class='l10n-lastModified'>" + $date.text() + "</span></a>"))
                    .append($("<a class='size' href='" + $size.attr("href") + "'><span class='l10n-size'>" + $size.text() + "</span></a>"));

            // header sort icons
            if (order.ascending) {
                $icon = $("<img src='/h5ai/images/ascending.png' class='sort' alt='ascending' />");
            } else {
                $icon = $("<img src='/h5ai/images/descending.png' class='sort' alt='descending' />");
            }
            if (order.column === "date") {
                $li.find("a.date").prepend($icon);
            } else if (order.column === "size") {
                $li.find("a.size").prepend($icon);
            } else {
                $li.find("a.label").append($icon);
            }

            // entries
            $("#table td").closest("tr").each(function () {
                var path = pathCache.getPath(document.location.pathname, this);
                $ul.append(path.updateExtendedHtml());
            });

            $("#extended").append($ul);

            // empty
            if ($ul.children(".entry:not(.parentfolder)").size() === 0) {
                $("#extended").append($("<div class='empty l10n-empty'>empty</div>"));
            }
        },
        customize = function () {

            $.ajax({
                url: settings.customHeader,
                dataType: "html",
                success: function (data) {
                    $("#content > header").append($(data)).show();
                }
            });

            $.ajax({
                url: settings.customFooter,
                dataType: "html",
                success: function (data) {
                    $("#content > footer").prepend($(data)).show();
                }
            });
        },
        initCounts = function () {

            $(".folderCount").text($("#extended .entry.folder:not(.parentfolder)").size());
            $(".fileCount").text($("#extended .entry.file").size());
        },
        init = function () {

            initTitle();
            initBreadcrumb();
            initExtendedView();
            customize();
            initCounts();
        },
        extended = {
            init: init
        };

    return extended;
};
