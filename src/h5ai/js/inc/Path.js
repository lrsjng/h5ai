/*global $, H5aiJs */

H5aiJs.factory.Path = function (folder, tableRow) {

    var checkedDecodeUri = function (uri) {

            try { return decodeURI(uri); } catch (err) {}
            return uri;
        },
        $tds, $img, $a, splits;

    // parentFolder: undefined,
    // label: undefined,
    // dateOrgStr: undefined,
    // date: undefined,
    // time: undefined,
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

    this.status = undefined;  // undefined, "h5ai" or HTTP response code
    this.content = undefined;  // associative array path.absHref -> path
    this.html = {
        $crumb: undefined,
        $extended: undefined,
        $tree: undefined
    };
    this.treeOpen = false;

    if (!H5aiJs.pathCache.pathEndsWithSlash(folder)) {
        folder += "/";
    }

    if (tableRow) {
        $tds = $(tableRow).find("td");
        $img = $tds.eq(0).find("img");
        $a = $tds.eq(1).find("a");

        this.parentFolder = folder;
        this.label = $a.text();
        this.dateOrgStr = $tds.eq(2).text();
        this.date = Date.parse(this.dateOrgStr);
        this.time = this.date ? this.date.getTime() : 0;
        this.size = $tds.eq(3).text();
        this.href = $a.attr("href");
        this.alt = $img.attr("alt");
        this.icon16 = $img.attr("src");
    } else {
        splits = H5aiJs.pathCache.splitPathname(folder);

        this.parentFolder = splits[0];
        this.label = checkedDecodeUri(splits[1]);
        if (this.label === "/") {
            this.label = checkedDecodeUri(document.domain) + "/";
        }
        this.dateOrgStr = "";
        this.date = null;
        this.time = 0;
        this.size = "";
        this.href = splits[1];
        this.alt = "[DIR]";
        this.icon16 = H5aiJs.h5ai.icon("folder");
    }

    if (H5aiJs.pathCache.pathEndsWithSlash(this.label)) {
        this.label = this.label.slice(0, -1);
    }

    this.icon48 = this.icon16.replace("16x16", "48x48");
    this.isFolder = (this.alt === "[DIR]");
    this.isParentFolder = (this.isFolder && this.label === "Parent Directory");
    this.absHref = this.isParentFolder ? this.href : this.parentFolder + this.href;
    this.isCurrentFolder = (this.absHref === document.location.pathname);
    this.isDomain = (this.absHref === "/");

    if (this.isParentFolder && H5aiJs.h5ai.settings.setParentFolderLabels) {
        if (this.isDomain) {
            this.label = checkedDecodeUri(document.domain);
        } else {
            this.label = checkedDecodeUri(H5aiJs.pathCache.splitPathname(H5aiJs.pathCache.splitPathname(this.parentFolder)[0])[1].slice(0, -1));
        }
    }
};

H5aiJs.factory.Path.prototype = {

    isEmpty: function () {

        return !this.content || $.isEmptyObject(this.content);
    },
    onClick: function (context) {

        H5aiJs.h5ai.triggerPathClick(this, context);
    }
};
