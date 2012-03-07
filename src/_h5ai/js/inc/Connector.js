
(function ($, h5ai) {

	var cache = {},
		pathnameStatusCache = {},
		contentTypeRegEx = /^text\/html;h5ai=/,
		getPath = function (folder, tableRow) {

			var absHref = h5ai.util.getAbsHref(folder, tableRow),
				path = cache[absHref];

			if (!path) {
				path = h5ai.Path(folder, tableRow);
				if (!path.isParentFolder) {
					cache[path.absHref] = path;
				}
			}

			return path;
		},
		fetchStatus = function (pathname, callback) {

			if (h5ai.settings.folderStatus[pathname]) {
				callback(h5ai.settings.folderStatus[pathname]);
				return;
			} else if (pathnameStatusCache[pathname]) {
				callback(pathnameStatusCache[pathname]);
				return;
			}

			$.ajax({
				url: pathname,
				type: 'HEAD',
				complete: function (xhr) {

					var status = xhr.status;

					if (status === 200 && contentTypeRegEx.test(xhr.getResponseHeader('Content-Type'))) {
						status = 'h5ai';
					}
					pathnameStatusCache[pathname] = status;
					callback(status);
				}
			});
		},
		updatePath = function (path) {

			if (path.isFolder && !path.isParentFolder && path.status === undefined) {
				fetchStatus(path.absHref, function (status) {

					if (status !== 'h5ai') {
						path.status = status;
					}
					h5ai.html.updateHtml(path);
					h5ai.core.linkHoverStates();
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

				if (status !== 'h5ai') {
					callback(status, {});
					return;
				}

				$.ajax({
					url: pathname,
					type: 'GET',
					dataType: 'html',
					error: function (xhr) {

						callback(xhr.status, {}); // since it was checked before this should never happen
					},
					success: function (html, status, xhr) {

						var content = {};

						if (!contentTypeRegEx.test(xhr.getResponseHeader('Content-Type'))) {
							callback(xhr.status, {}); // since it was checked before this should never happen
							return;
						}

						$(html).find('#table td').closest('tr').each(function () {

							var path = getPath(pathname, this);

							if (path.isFolder && (!path.isParentFolder || includeParent)) {
								content[path.absHref] = path;
								updatePath(path);
							}
						});
						callback('h5ai', content);
					}
				});
			});
		};

	h5ai.connector = {
		getPath: getPath,
		updatePaths: updatePaths,
		fetchStatusAndContent: fetchStatusAndContent
	};

}(jQuery, h5ai));
