/*global $, H5aiJs */

H5aiJs.factory.Path = function (folder, tableRow) {

    var path,
        checkedDecodeUri = function (uri) {

            try { return decodeURI(uri); } catch (err) {}
            return uri;
        },
        isEmpty = function () {

            return !path.content || $.isEmptyObject(path.content);
        },
        onClick = function (context) {

            H5aiJs.h5ai.triggerPathClick(path, context);
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
                onClick: onClick
            };

            if (!H5aiJs.pathCache.pathEndsWithSlash(folder)) {
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
                splits = H5aiJs.pathCache.splitPathname(folder);

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

            if (H5aiJs.pathCache.pathEndsWithSlash(path.label)) {
                path.label = path.label.slice(0, -1);
            }

            path.icon48 = path.icon16.replace("16x16", "48x48");
            path.isFolder = (path.alt === "[DIR]");
            path.isParentFolder = (path.isFolder && path.label === "Parent Directory");
            path.absHref = path.isParentFolder ? path.href : path.parentFolder + path.href;
            path.isCurrentFolder = (path.absHref === document.location.pathname);
            path.isDomain = (path.absHref === "/");

            if (path.isParentFolder && H5aiJs.h5ai.settings.setParentFolderLabels) {
                if (path.isDomain) {
                    path.label = checkedDecodeUri(document.domain);
                } else {
                    path.label = checkedDecodeUri(H5aiJs.pathCache.splitPathname(H5aiJs.pathCache.splitPathname(path.parentFolder)[0])[1].slice(0, -1));
                }
            }
        };

    init();

    return path;
};
