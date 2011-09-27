/*global $, Objects */

Objects.Tree = function (pathCache, h5ai) {

    var contentTypeRegEx = /^text\/html;h5ai=/,
        pathnameStatusCache = {},
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
                    path.updateHtml();
                    h5ai.linkHoverStates();
                });
            }
        },
        updatePaths = function () {

            $.each(pathCache.cache, function (ref, cached) {
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

                            var path = pathCache.getPath(pathname, this);

                            if (path.isFolder && (!path.isParentFolder || includeParent)) {
                                content[path.absHref] = path;
                                updatePath(path);
                            }
                        });
                        callback("h5ai", content);
                    }
                });
            });
        },
        fetchPath = function (pathname, callback) {

            fetchStatusAndContent(pathname, false, function (status, content) {

                var path = pathCache.getPath(pathname);

                path.status = status;
                path.content = content;
                callback(path);
            });
        },
        fetchTree = function (pathname, callback, childPath) {

            fetchPath(pathname, function (path) {

                var parent = pathCache.splitPathname(pathname)[0];

                path.treeOpen = true;
                if (childPath) {
                    path.content[childPath.absHref] = childPath;
                }
                if (parent === "") {
                    callback(path);
                } else {
                    fetchTree(parent, callback, path);
                }
            });
        },
        populateTree = function () {

            fetchTree(document.location.pathname, function (path) {
                $("#tree")
                    .append(path.updateTreeHtml())
                    .scrollpanel()
                    .show();
                h5ai.shiftTree(false, true);
                h5ai.linkHoverStates();
                setTimeout(function () { $("#tree").get(0).updateScrollbar(); }, 1);
            });
        },
        init = function () {

            if (h5ai.settings.showTree) {
                updatePaths();
                populateTree();
            }
        },
        tree = {
            fetchStatusAndContent: fetchStatusAndContent,
            init: init
        };

    return tree;
};
