/*global $, H5aiJs */

H5aiJs.factory.PathCache = function () {

    var cache = {},
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
                path = new H5aiJs.factory.Path(folder, tableRow);
                if (!path.isParentFolder) {
                    cache[path.absHref] = path;
                }
            }

            return path;
        };

    this.splitPathname = splitPathname;
    this.pathEndsWithSlash = pathEndsWithSlash;
    this.getPath = getPath;
    this.cache = cache;
};
