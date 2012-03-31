
Module.define('extended', [jQuery, 'settings', 'conhtml', 'util', 'core'], function ($, settings, conhtml, util, core) {

	var initBreadcrumb = function () {

			var $ul = $("body > nav ul"),
				pathname = "/",
				path = conhtml.getPath(pathname),
				pathnameParts = document.location.pathname.split("/"),
				lastPart = "",
				title = document.domain;

			$ul.append(conhtml.updateCrumbHtml(path));

			$.each(pathnameParts, function (idx, part) {
				if (part !== "") {
					pathname += part + "/";
					$ul.append(conhtml.updateCrumbHtml(conhtml.getPath(pathname)));
					lastPart = part + " - ";
					title += " > " + part;
				}
			});

			document.title = util.checkedDecodeUri(lastPart + title);
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
				var path = conhtml.getPath(document.location.pathname, this);
				$ul.append(conhtml.updateExtendedHtml(path));
			});

			$("#extended").append($ul);

			// empty
			if ($ul.children(".entry:not(.folder-parent)").size() === 0) {
				$("#extended").append($("<div class='empty l10n-empty'>empty</div>"));
			}

			// no match
			$("#extended").append($("<div class='no-match l10n-noMatch'>no match</div>"));
		},
		customize = function () {

			if (settings.customHeader) {
				$.ajax({
					url: settings.customHeader,
					dataType: "html",
					success: function (data) {
						$("#content > header").append($(data)).show();
					}
				});
			}

			if (settings.customFooter) {
				$.ajax({
					url: settings.customFooter,
					dataType: "html",
					success: function (data) {
						$("#content > footer").prepend($(data)).show();
					}
				});
			}
		},
		fetchPath = function (pathname, callback) {

			conhtml.fetchStatusAndContent(pathname, false, function (status, content) {

				var path = conhtml.getPath(pathname);

				path.status = status;
				path.content = content;
				callback(path);
			});
		},
		fetchTree = function (pathname, callback, childPath) {

			fetchPath(pathname, function (path) {

				var parent = util.splitPath(pathname).parent;

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
					.append(conhtml.updateTreeHtml(path))
					.scrollpanel()
					.show();
				core.shiftTree(false, true);
				core.linkHoverStates();
				setTimeout(function () { $("#tree").get(0).updateScrollbar(); }, 1);
			});
		},
		init = function () {

			initBreadcrumb();
			initExtendedView();
			customize();
			conhtml.updatePaths();
			if (settings.showTree) {
				populateTree();
			}
		};

	return {
		init: init
	};
});
