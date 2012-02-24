
(function ($, H5AI) {

	H5AI.connector = (function () {

		var cache = {},
			pathnameStatusCache = {},
			contentTypeRegEx = /^text\/html;h5ai=/,
			getPath = function (folder, tableRow) {

				var absHref = H5AI.util.getAbsHref(folder, tableRow),
					path = cache[absHref];

				if (!path) {
					path = H5AI.Path(folder, tableRow);
					if (!path.isParentFolder) {
						cache[path.absHref] = path;
					}
				}

				return path;
			},
			fetchStatus = function (pathname, callback) {

				if (H5AI.core.settings.folderStatus[pathname]) {
					callback(H5AI.core.settings.folderStatus[pathname]);
					return;
				} else if (pathnameStatusCache[pathname]) {
					callback(pathnameStatusCache[pathname]);
					return;
				}

				$.ajax({
					url: pathname,
					type: "HEAD",
					complete: function (xhr) {

						var status = xhr.status;

						if (status === 200 && contentTypeRegEx.test(xhr.getResponseHeader("Content-Type"))) {
							status = "h5ai";
						}
						pathnameStatusCache[pathname] = status;
						callback(status);
					}
				});
			},
			updatePath = function (path) {

				if (path.isFolder && !path.isParentFolder && path.status === undefined) {
					fetchStatus(path.absHref, function (status) {

						if (status !== "h5ai") {
							path.status = status;
						}
						H5AI.html.updateHtml(path);
						H5AI.core.linkHoverStates();
					});
				}
			},
			updatePaths = function () {

				$.each(cache, function (ref, cached) {
					updatePath(cached);
				});
			},
			fetchStatusAndContent = function (pathname, includeParent, callback) {

				fetchStatus(pathname, function (status) {

					if (status !== "h5ai") {
						callback(status, {});
						return;
					}

					$.ajax({
						url: pathname,
						type: "GET",
						dataType: "html",
						error: function (xhr) {

							callback(xhr.status, {}); // since it was checked before this should never happen
						},
						success: function (html, status, xhr) {

							var content = {};

							if (!contentTypeRegEx.test(xhr.getResponseHeader("Content-Type"))) {
								callback(xhr.status, {}); // since it was checked before this should never happen
								return;
							}

							$(html).find("#table td").closest("tr").each(function () {

								var path = getPath(pathname, this);

								if (path.isFolder && (!path.isParentFolder || includeParent)) {
									content[path.absHref] = path;
									updatePath(path);
								}
							});
							callback("h5ai", content);
						}
					});
				});
			};

		return {
			getPath: getPath,
			updatePaths: updatePaths,
			fetchStatusAndContent: fetchStatusAndContent
		};
	}());

}(jQuery, H5AI));
