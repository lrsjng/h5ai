
(function (document, $, H5AI) {

	H5AI.Path = function (folder, tableRow) {

		var path = {},
			$tds, $a, date, size, splits;

		// path.parentFolder: undefined
		// path.label: undefined
		// path.type: undefined
		// path.href: undefined
		// path.time: undefined
		// path.size: undefined
		// path.absHref: undefined
		// path.isFolder: undefined
		// path.isParentFolder: undefined
		// path.isCurrentFolder: undefined
		// path.isDomain: undefined

		path.status = undefined;  // undefined, "h5ai" or HTTP response code
		path.content = undefined;  // associative array path.absHref -> path
		path.html = {
			$crumb: undefined,
			$extended: undefined,
			$tree: undefined
		};
		path.treeOpen = false;

		if (!H5AI.util.pathEndsWithSlash(folder)) {
			folder += "/";
		}

		if (tableRow) {
			$tds = $(tableRow).find("td");
			$a = $tds.eq(1).find("a");
			date = Date.parse($tds.eq(2).text());
			size = H5AI.util.parseSize($tds.eq(3).text());

			path.parentFolder = folder;
			path.label = $a.text();
			path.type = $tds.eq(0).find("img").attr("alt") === "[DIR]" ? "folder" : H5AI.core.getFileType(path.label);
			path.href = $a.attr("href");
			path.time = date ? date.getTime() : 0;
			path.size = size;
		} else {
			splits = H5AI.util.splitPath(folder);

			path.parentFolder = splits.parent || "";
			path.label = H5AI.util.checkedDecodeUri(splits.name);
			if (path.label === "/") {
				path.label = H5AI.util.checkedDecodeUri(document.domain);
			}
			path.type = "folder";
			path.href = splits.name;
			path.time = 0;
			path.size = -1;
		}

		if (H5AI.util.pathEndsWithSlash(path.label)) {
			path.label = path.label.slice(0, -1);
		}

		path.isFolder = (path.type === "folder");
		path.isParentFolder = (path.label === "Parent Directory");
		if (path.isParentFolder) {
			path.isFolder = true;
			path.type = "folder-parent";
		}
		path.absHref = path.isParentFolder ? path.href : path.parentFolder + path.href;
		path.isCurrentFolder = (path.absHref === document.location.pathname);
		path.isDomain = (path.absHref === "/");

		if (path.isParentFolder && H5AI.core.settings.setParentFolderLabels) {
			if (path.isDomain) {
				path.label = H5AI.util.checkedDecodeUri(document.domain);
			} else {
				splits = H5AI.util.splitPath(path.parentFolder);
				path.label = H5AI.util.checkedDecodeUri(splits.parentname);
			}
		}

		path.isEmpty = function () {

			return !path.content || $.isEmptyObject(path.content);
		};
		path.onClick = function (context) {

			H5AI.core.triggerPathClick(path, context);
		};

		return path;
	};

}(document, jQuery, H5AI));
