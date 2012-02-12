
(function ($, H5AI) {

	H5AI.sort = (function () {

		var type = function (entry) {

				var $entry = $(entry);

				if ($entry.hasClass("folder-parent")) {
					return 0;
				} else if ($entry.hasClass("folder")) {
					return 1;
				}
				return 2;
			},
			cmp = function (entry1, entry2, rev, getVal) {

				var res, val1, val2;

				res = type(entry1) - type(entry2);
				if (res !== 0) {
					return res;
				}

				val1 = getVal(entry1);
				val2 = getVal(entry2);
				if (val1 < val2) {
					return rev ? 1 : -1;
				} else if (val1 > val2) {
					return rev ? -1 : 1;
				}
				return 0;
			},
			cmpName = function (entry1, entry2) {

				return cmp(entry1, entry2, false, function (entry) {
					return $(entry).find(".label").text().toLowerCase();
				});
			},
			cmpTime = function (entry1, entry2) {

				return cmp(entry1, entry2, false, function (entry) {
					return $(entry).find(".date").data("time");
				});
			},
			cmpSize = function (entry1, entry2) {

				return cmp(entry1, entry2, false, function (entry) {
					return $(entry).find(".size").data("bytes");
				});
			},
			cmpNameRev = function (entry1, entry2) {

				return cmp(entry1, entry2, true, function (entry) {
					return $(entry).find(".label").text().toLowerCase();
				});
			},
			cmpTimeRev = function (entry1, entry2) {

				return cmp(entry1, entry2, true, function (entry) {
					return $(entry).find(".date").data("time");
				});
			},
			cmpSizeRev = function (entry1, entry2) {

				return cmp(entry1, entry2, true, function (entry) {
					return $(entry).find(".size").data("bytes");
				});
			},
			sort = function (fn) {

				$("#extended .entry").detach().sort(fn).appendTo($("#extended > ul"));
			},
			$all, orders,
			sortBy = function (id) {

				var order = orders[id];

				$all.removeClass("ascending").removeClass("descending");
				order.head.addClass(order.clas).attr("href", "#!/sort=" + id);
				sort(order.fn);
			},
			init = function () {

				var $ascending = $("<img src='" + H5AI.core.image("ascending") + "' class='sort ascending' alt='ascending' />"),
					$descending = $("<img src='" + H5AI.core.image("descending") + "' class='sort descending' alt='descending' />"),
					initialOrder = /^.*#!.*\/sort=(.*?)(?:\/.*)?$/.exec(document.location),
					$header = $("#extended li.header"),
					$label = $header.find("a.label"),
					$date = $header.find("a.date"),
					$size = $header.find("a.size");

				$all = $header.find("a.label,a.date,a.size");
				orders = {
					na: {
						head: $label,
						clas: "ascending",
						fn: cmpName
					},
					nd: {
						head: $label,
						clas: "descending",
						fn: cmpNameRev
					},
					da: {
						head: $date,
						clas: "ascending",
						fn: cmpTime
					},
					dd: {
						head: $date,
						clas: "descending",
						fn: cmpTimeRev
					},
					sa: {
						head: $size,
						clas: "ascending",
						fn: cmpSize
					},
					sd: {
						head: $size,
						clas: "descending",
						fn: cmpSizeRev
					}
				};

				sortBy(initialOrder ? initialOrder[1] : H5AI.core.settings.sortorder);

				$label
					.attr("href", "#!/sort=na")
					.append($ascending.clone()).append($descending.clone())
					.click(function () {
						sortBy("n" + ($label.hasClass("ascending") ? "d" : "a"));
					});

				$date
					.attr("href", "#!/sort=da")
					.prepend($ascending.clone()).prepend($descending.clone())
					.click(function () {
						sortBy("d" + ($date.hasClass("ascending") ? "d" : "a"));
					});

				$size
					.attr("href", "#!/sort=sa")
					.prepend($ascending.clone()).prepend($descending.clone())
					.click(function () {
						sortBy("s" + ($size.hasClass("ascending") ? "d" : "a"));
					});
			};

		return {
			init: init
		};
	}());

}(jQuery, H5AI));
