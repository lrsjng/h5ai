
(function (document, $, h5ai) {

	var initBreadcrumb = function () {

			var $ul = $("body > nav ul"),
				pathname = "/",
				path = h5ai.connector.getPath(pathname),
				pathnameParts = document.location.pathname.split("/"),
				lastPart = "",
				title = document.domain;

			$ul.append(h5ai.html.updateCrumbHtml(path));

			$.each(pathnameParts, function (idx, part) {
				if (part !== "") {
					pathname += part + "/";
					$ul.append(h5ai.html.updateCrumbHtml(h5ai.connector.getPath(pathname)));
					lastPart = part + " - ";
					title += " > " + part;
				}
			});

			document.title = h5ai.util.checkedDecodeUri(lastPart + title);
		},
		initExtendedView = function () {

			var $ul, $li;

			$ul = $("<ul/>");
			$li = $("<li class='header' />")
					.appendTo($ul)
					.append($("<a class='icon'></a>"))
					.append($("<a class='label' href='#'><span class='l10n-name'></span></a>"))
					.append($("<a class='date' href='#'><span class='l10n-lastModified'></span></a>"))
					.append($("<a class='size' href='#'><span class='l10n-size'></span></a>"));

			// entries
			$("#table td").closest("tr").each(function () {
				var path = h5ai.connector.getPath(document.location.pathname, this);
				$ul.append(h5ai.html.updateExtendedHtml(path));
			});

			$("#extended").append($ul);

			// empty
			if ($ul.children(".entry:not(.folder-parent)").size() === 0) {
				$("#extended").append($("<div class='empty l10n-empty'>empty</div>"));
			}
			$("#extended").append($("<div class='no-match l10n-noMatch'>no match</div>"));
		},
		customize = function () {

			if (h5ai.core.settings.customHeader) {
				$.ajax({
					url: h5ai.core.settings.customHeader,
					dataType: "html",
					success: function (data) {
						$("#content > header").append($(data)).show();
					}
				});
			}

			if (h5ai.core.settings.customFooter) {
				$.ajax({
					url: h5ai.core.settings.customFooter,
					dataType: "html",
					success: function (data) {
						$("#content > footer").prepend($(data)).show();
					}
				});
			}
		},
		fetchPath = function (pathname, callback) {

			h5ai.connector.fetchStatusAndContent(pathname, false, function (status, content) {

				var path = h5ai.connector.getPath(pathname);

				path.status = status;
				path.content = content;
				callback(path);
			});
		},
		fetchTree = function (pathname, callback, childPath) {

			fetchPath(pathname, function (path) {

				var parent = h5ai.util.splitPath(pathname).parent;

				path.treeOpen = true;
				if (childPath) {
					path.content[childPath.absHref] = childPath;
				}
				if (parent === null) {
					callback(path);
				} else {
					fetchTree(parent, callback, path);
				}
			});
		},
		populateTree = function () {

			fetchTree(document.location.pathname, function (path) {
				$("#tree")
					.append(h5ai.html.updateTreeHtml(path))
					.scrollpanel()
					.show();
				h5ai.core.shiftTree(false, true);
				h5ai.core.linkHoverStates();
				setTimeout(function () { $("#tree").get(0).updateScrollbar(); }, 1);
			});
		},
		init = function () {

			initBreadcrumb();
			initExtendedView();
			customize();
			h5ai.connector.updatePaths();
			if (h5ai.core.settings.showTree) {
				populateTree();
			}
		};

	h5ai.extended = {
		init: init
	};

}(document, jQuery, h5ai));
