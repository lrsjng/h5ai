
(function ($, H5AI) {

	H5AI.util = (function () {

		var reSplitPath = /^\/([^\/]+\/?)$/,
			reSplitPath2 = /^(\/(?:.*\/)*?([^\/]+)\/)([^\/]+\/?)$/,
			splitPath = function (pathname) {

				var match;

				if (pathname === "/") {
					return {
						parent: null,
						parentname: null,
						name: "/"
					};
				}
				match = reSplitPath2.exec(pathname);
				if (match) {
					return {
						parent: match[1],
						parentname: match[2],
						name: match[3]
					};
				}
				match = reSplitPath.exec(pathname);
				if (match) {
					return {
						parent: "/",
						parentname: "/",
						name: match[1]
					};
				}
			},
			rePathEndsWithSlash = /\/$/,
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
			kilo = 1000.0,
			reParseSize = /^\s*([\.\d]+)\s*([kmg]?)b?\s*$/i,
			parseSize = function (str) {

				var match = reParseSize.exec(str),
					val, unit;

				if (!match) {
					return -1;
				}

				val = parseFloat(match[1]);
				unit = match[2].toLowerCase();
				if (unit === "k") {
					val *= kilo;
				} else if (unit === "m") {
					val *= kilo * kilo;
				} else if (unit === "g") {
					val *= kilo * kilo * kilo;
				} else if (unit === "t") {
					val *= kilo * kilo * kilo * kilo;
				}
				return val;
			},
			sizeUnits = ["B", "KB", "MB", "GB", "TB"],
			formatSize = function (size) {

				var th = 1000.0,
					i = 0,
					maxI = sizeUnits.length - 1;

				if (isNaN(size)) {
					return size;
				}

				while (size >= th && i < maxI) {
					size /= kilo;
					i += 1;
				}
				return (i <= 1 ? Math.round(size) : size.toFixed(1)).toString() + " " + sizeUnits[i];
			},
			checkedDecodeUri = function (uri) {

				try {
					return decodeURI(uri);
				} catch (err) {}
				return uri;
			};

		return {
			splitPath: splitPath,
			pathEndsWithSlash: pathEndsWithSlash,
			getAbsHref: getAbsHref,
			parseSize: parseSize,
			formatSize: formatSize,
			checkedDecodeUri: checkedDecodeUri
		};
	}());

}(jQuery, H5AI));
