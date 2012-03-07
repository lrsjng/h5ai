
(function (window, $, h5ai) {

	var $window = $(window),
		settings = h5ai.settings,
		extToFileType = (function (types) {
			var map = {};
			$.each(types, function (type, exts) {
				$.each(exts, function (idx, ext) {
					map[ext] = type;
				});
			});
			return map;
		}(h5ai.config.types)),
		hash = function (obj) {

			if ($.isPlainObject(obj)) {
				var hashStr = '';
				$.each($.extend({}, hash(), obj), function (key, value) {
					if (value) {
						hashStr += '/' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
					}
				});
				hashStr = '#!' + hashStr;
				window.location.hash = hashStr;
				return hashStr;
			} else {
				var result = {},
					parts = document.location.hash.split('/');

				if (parts.length >= 2 || parts[0] === '#!') {
					parts.shift();
					$.each(parts, function (idx, part) {

						var match = /^([^=]*)=(.*?)$/.exec(part);
						if (match) {
							result[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
						}
					});
				}
				return typeof obj === 'string' ? result[obj] : result;
			}
		},
		api = function () {

			return settings.h5aiAbsHref + "php/api.php";
		},
		image = function (id, noPngExt) {

			return settings.h5aiAbsHref + "images/" + id + (noPngExt ? "" : ".png");
		},
		icon = function (id, big) {

			return settings.h5aiAbsHref + "icons/" + (big ? "48x48" : "16x16") + "/" + id + ".png";
		},
		viewmode = function (viewmode) {

			var $viewDetails = $("#viewdetails"),
				$viewIcons = $("#viewicons"),
				$extended = $("#extended");

			if (viewmode) {
				amplify.store(settings.store.viewmode, viewmode);
			} else {
				viewmode = amplify.store(settings.store.viewmode);
			}
			viewmode = $.inArray(viewmode, settings.viewmodes) >= 0 ? viewmode : settings.viewmodes[0];
			h5ai.core.hash({view: viewmode});

			$viewDetails.add($viewIcons).removeClass("current");
			if (viewmode === "details") {
				$viewDetails.addClass("current");
				$extended.addClass("details-view").removeClass("icons-view").show();
			} else if (viewmode === "icons") {
				$viewIcons.addClass("current");
				$extended.removeClass("details-view").addClass("icons-view").show();
			} else {
				$extended.hide();
			}
		},
		initTopSpace = function () {

			var $body = $("body"),
				$tree = $("#tree"),
				adjustTopSpace = function () {

					var winHeight = $window.height(),
						navHeight = $("body > nav").outerHeight(),
						footerHeight = $("body > footer").outerHeight(),
						contentSpacing = 50,
						treeSpacing = 0;

					$body.css({
						"margin-top": navHeight + contentSpacing,
						"margin-bottom": footerHeight + contentSpacing
					});

					$tree.css({
						top: navHeight + treeSpacing,
						height: winHeight - navHeight - footerHeight - 16 - 2 * treeSpacing
					});

					try {
						$tree.get(0).updateScrollbar();
					} catch (err) {}
				};

			$window.resize(function () {
				adjustTopSpace();
			});
			adjustTopSpace();
		},
		initViews = function () {

			var $navbar = $("#navbar"),
				$extended = $("#extended");

			$("#table").remove();

			if (settings.viewmodes.length > 1) {
				if ($.inArray("icons", settings.viewmodes) >= 0) {
					$("<li id='viewicons' class='view'><a href='#'><img alt='view-icons' /><span class='l10n-icons'>icons</span></a></li>")
						.find("img").attr("src", image("view-icons")).end()
						.find("a").click(function (event) {
							viewmode("icons");
							event.preventDefault();
						}).end()
						.appendTo($navbar);
				}
				if ($.inArray("details", settings.viewmodes) >= 0) {
					$("<li id='viewdetails' class='view'><a href='#'><img alt='view-details' /><span class='l10n-details'>details</span></a></li>")
						.find("img").attr("src", image("view-details")).end()
						.find("a").click(function (event) {
							viewmode("details");
							event.preventDefault();
						}).end()
						.appendTo($navbar);
				}
			}

			// status update
			$extended.find(".entry a").hover(
				function () {
					if ($extended.hasClass("icons-view")) {
						var $this = $(this);
						$(".status.default").hide();
						$(".status.dynamic")
							.empty()
							.append($this.find(".label").clone())
							.append($("<span class='sep'>·</span>"))
							.append($this.find(".date").clone())
							.show();

						if (!$this.closest(".entry").hasClass("folder")) {
							$(".status.dynamic")
								.append($("<span class='sep'>·</span>"))
								.append($this.find(".size").clone());
						}
					}
				},
				function () {
					$(".status.default").show();
					$(".status.dynamic").empty().hide();
				}
			);
		},
		shiftTree = function (forceVisible, dontAnimate) {

			var $tree = $("#tree"),
				$extended = $("#extended");

			if ((settings.slideTree && $tree.outerWidth() < $extended.offset().left) || forceVisible) {
				if (dontAnimate) {
					$tree.stop().css({ left: 0 });
				} else {
					$tree.stop().animate({ left: 0 });
				}
			} else {
				if (dontAnimate) {
					$tree.stop().css({ left: 18 - $tree.outerWidth() });
				} else {
					$tree.stop().animate({ left: 18 - $tree.outerWidth() });
				}
			}
		},
		initTree = function () {

			$("#tree").hover(
				function () { shiftTree(true); },
				function () { shiftTree(); }
			);
			$window.resize(function () { shiftTree(); });
			shiftTree(false, true);
		},
		selectLinks = function (href) {

			var elements = [];
			$("a[href^='/']").each(function () {

				if ($(this).attr("href") === href) {
					elements.push(this);
				}
			});
			return $(elements);
		},
		linkHoverStates = function () {

			if (settings.linkHoverStates) {
				$("a[href^='/']:not(.linkedHoverStates)").each(function () {

					var $a = $(this).addClass("linkedHoverStates"),
						href = $a.attr("href");

					$a.hover(
						function () { selectLinks(href).addClass("hover"); },
						function () { selectLinks(href).removeClass("hover"); }
					);
				});
			}
		},
		onIndicatorClick = function (event) {

			var $indicator = $(this),
				$entry = $indicator.closest(".entry"),
				updateTreeScrollbar = $("#tree").get(0).updateScrollbar;

			if ($indicator.hasClass("unknown")) {
				$.get(api(), { "action": "tree", "href": $entry.find("> a").attr("href") }, function (html) {

					var $content = $(html);

					$indicator.removeClass("unknown");
					if ($content.find("> li").size() === 0) {
						$indicator.replaceWith($("<span class='blank' />"));
					} else {
						$indicator.addClass("open");
						$entry.find("> .content").replaceWith($content);
						updateTreeScrollbar();
						$content.find(".indicator:not(.initiated)")
							.click(onIndicatorClick)
							.addClass("initiated");
					}
				});
			} else if ($indicator.hasClass("open")) {
				$indicator.removeClass("open");
				updateTreeScrollbar(true);
				$entry.find("> .content").slideUp(function () {
					updateTreeScrollbar();
				});
			} else {
				$indicator.addClass("open");
				updateTreeScrollbar(true);
				$entry.find("> .content").slideDown(function () {
					updateTreeScrollbar();
				});
			}
		},
		initIndicators = function () {

			$("#tree .entry.folder .indicator:not(.initiated)")
				.click(onIndicatorClick)
				.addClass("initiated");
		},
		getFileType = function (filename) {

			var dotidx = filename.lastIndexOf('.'),
				ext = dotidx >= 0 ? filename.substr(dotidx) : filename;

			return extToFileType[ext.toLowerCase()] || "unknown";
		},
		formatSizes = function () {

			$("#extended .entry .size").each(function () {

				var $this = $(this),
					bytes = $this.data("bytes"),
					formattedSize = bytes >= 0 ? h5ai.util.formatSize(bytes) : "";

				$this.text(formattedSize);
			});
		},
		setTotals = function () {

			var $extended = $("#extended");

			$(".folderTotal").text($extended.find(".entry.folder:not(.folder-parent)").length);
			$(".fileTotal").text($extended.find(".entry.file").length);
		},
		init = function () {

			initViews();
			viewmode();
			initTopSpace();
			initTree();
			linkHoverStates();
			formatSizes();
			setTotals();
			initIndicators();
		};

	h5ai.core = {
		hash: hash,
		api: api,
		image: image,
		icon: icon,
		shiftTree: shiftTree,
		linkHoverStates: linkHoverStates,
		initIndicators: initIndicators,
		getFileType: getFileType,
		init: init
	};

}(window, jQuery, h5ai));
