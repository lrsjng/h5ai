
(function (document, $, H5AI) {

	H5AI.extended = (function () {

		var initBreadcrumb = function () {

				var $ul = $("body > nav ul"),
					pathname = "/",
					path = H5AI.connector.getPath(pathname),
					pathnameParts = document.location.pathname.split("/"),
					lastPart = "",
					title = document.domain;

				$ul.append(H5AI.html.updateCrumbHtml(path));

				$.each(pathnameParts, function (idx, part) {
					if (part !== "") {
						pathname += part + "/";
						$ul.append(H5AI.html.updateCrumbHtml(H5AI.connector.getPath(pathname)));
						lastPart = part + " - ";
						title += " > " + part;
					}
				});

				document.title = H5AI.util.checkedDecodeUri(lastPart + title);
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
					var path = H5AI.connector.getPath(document.location.pathname, this);
					$ul.append(H5AI.html.updateExtendedHtml(path));
				});

				$("#extended").append($ul);

				// empty
				if ($ul.children(".entry:not(.folder-parent)").size() === 0) {
					$("#extended").append($("<div class='empty l10n-empty'>empty</div>"));
				}
			},
			customize = function () {

				if (H5AI.core.settings.customHeader) {
					$.ajax({
						url: H5AI.core.settings.customHeader,
						dataType: "html",
						success: function (data) {
							$("#content > header").append($(data)).show();
						}
					});
				}

				if (H5AI.core.settings.customFooter) {
					$.ajax({
						url: H5AI.core.settings.customFooter,
						dataType: "html",
						success: function (data) {
							$("#content > footer").prepend($(data)).show();
						}
					});
				}
			},
			fetchPath = function (pathname, callback) {

				H5AI.connector.fetchStatusAndContent(pathname, false, function (status, content) {

					var path = H5AI.connector.getPath(pathname);

					path.status = status;
					path.content = content;
					callback(path);
				});
			},
			fetchTree = function (pathname, callback, childPath) {

				fetchPath(pathname, function (path) {

					var parent = H5AI.util.splitPath(pathname).parent;

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
						.append(H5AI.html.updateTreeHtml(path))
						.scrollpanel()
						.show();
					H5AI.core.shiftTree(false, true);
					H5AI.core.linkHoverStates();
					setTimeout(function () { $("#tree").get(0).updateScrollbar(); }, 1);
				});
			},
			init = function () {

				initBreadcrumb();
				initExtendedView();
				customize();
				H5AI.connector.updatePaths();
				if (H5AI.core.settings.showTree) {
					populateTree();
				}
			};

		return {
			init: init
		};
	}());

}(document, jQuery, H5AI));
