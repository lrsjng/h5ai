
(function ($, H5AI) {

	H5AI.html = (function () {

		var thumbTypes = ["bmp", "gif", "ico", "image", "jpg", "png", "tiff"],
			onClick = function (path, context) {

			},
			updateCrumbHtml = function (path) {

				var $html, $a;

				if (path.html.$crumb && path.html.$crumb.data("status") === path.status) {
					return path.html.$crumb;
				}

				$html = $("<li class='crumb'><a><img alt='>' /><span></span></a></li>")
							.addClass(path.isFolder ? "folder" : "file");

				if (path.status) {
					$html.data("status", path.status);
				}

				$a = $html.find("a")
						.attr("href", path.absHref)
						.click(function() { onClick(path, "crumb"); })
						.find("img").attr("src", H5AI.core.image("crumb")).end()
						.find("span").text(path.label).end();

				if (path.isDomain) {
					$html.addClass("domain");
					$a.find("img").attr("src", H5AI.core.image("home"));
				}

				if (path.isCurrentFolder) {
					$html.addClass("current");
				}

				if (!isNaN(path.status)) {
					if (path.status === 200) {
						$a.append($("<img class='hint' src='" + H5AI.core.image("page") + "' alt='not listable' />"));
					} else {
						$a.append($("<span class='hint'>(" + path.status + ")</span>"));
					}
				}

				if (path.html.$crumb) {
					path.html.$crumb.replaceWith($html);
				}
				path.html.$crumb = $html;

				return $html;
			},
			updateExtendedHtml = function (path) {

				var $html, $a, $label,
					formattedDate = path.date ? path.date.toString(H5AI.core.settings.dateFormat) : "",
					imgClass = "",
					icon16 = H5AI.core.icon(path.type),
					icon48 = H5AI.core.icon(path.type, true);

				if (path.html.$extended && path.html.$extended.data("status") === path.status) {
					return path.html.$extended;
				}

				$html = $("<li class='entry' />")
							.data("path", path)
							.addClass(path.isFolder ? "folder" : "file");

				if (path.status) {
					$html.data("status", path.status);
				}

				if (H5AI.core.settings.showThumbs === true && $.inArray(path.type, thumbTypes) >= 0) {
					imgClass = "class='thumb'";
					icon16 = H5AI.core.api() + "?action=thumb&href=" + path.absHref + "&width=16&height=16&mode=square";
					icon48 = H5AI.core.api() + "?action=thumb&href=" + path.absHref + "&width=96&height=46&mode=rational";
				}

				$label = $("<span class='label'>" + path.label + "</span>");
				$a = $("<a />")
						.attr("href", path.absHref)
						.click(function() { onClick(path, "extended"); })
						.appendTo($html)
						.append($("<span class='icon small'><img " + imgClass + " src='" + icon16 + "' alt='" + path.type + "' /></span>"))
						.append($("<span class='icon big'><img " + imgClass + " src='" + icon48 + "' alt='" + path.type + "' /></span>"))
						.append($label)
						.append($("<span class='date' data-time='" + path.time + "'></span>"))
						.append($("<span class='size' data-bytes='" + path.size + "'></span>"));

				$a.hover(
					function () {
						if ($("#extended").hasClass("icons-view")) {
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

				if (path.isParentFolder) {
					if (!H5AI.core.settings.setParentFolderLabels) {
						$label.addClass("l10n-parentDirectory");
					}
					$html.addClass("folder-parent");
				}

				if (!isNaN(path.status)) {
					if (path.status === 200) {
						$html.addClass("page");
						$a.find(".icon.small img").attr("src", H5AI.core.icon("folder-page"));
						$a.find(".icon.big img").attr("src", H5AI.core.icon("folder-page", true));
					} else {
						$html.addClass("error");
						$label.append($("<span class='hint'> " + path.status + " </span>"));
					}
				}

				if (path.html.$extended) {
					path.html.$extended.replaceWith($html);
					H5AI.core.formatDates();
				}
				path.html.$extended = $html;

				return $html;
			},
			updateTreeHtml = function (path) {

				var $html, $blank, $a, $indicator, $ul, idx;

				$html = $("<div class='entry' />")
							.data("path", path)
							.addClass(path.isFolder ? "folder" : "file");

				$blank = $("<span class='blank' />").appendTo($html);

				$a = $("<a />")
						.attr("href", path.absHref)
						.click(function() { onClick(path, "tree"); })
						.appendTo($html)
						.append($("<span class='icon'><img src='" + H5AI.core.icon(path.type) + "' /></span>"))
						.append($("<span class='label'>" + path.label + "</span>"));

				if (path.isFolder) {
					// indicator
					if (path.status === undefined || !path.isEmpty()) {
						$indicator = $("<span class='indicator initiated'><img src='" + H5AI.core.image("tree") + "' /></span>")
							.click(function (event) {

								var $entry = $indicator.closest(".entry"); // $html

								if ($indicator.hasClass("unknown")) {
									H5AI.connector.fetchStatusAndContent(path.absHref, false, function (status, content) {

										path.status = status;
										path.content = content;
										path.treeOpen = true;
										$("#tree").get(0).updateScrollbar(true);
										updateTreeHtml(path);
										$("#tree").get(0).updateScrollbar();
									});
								} else if ($indicator.hasClass("open")) {
									path.treeOpen = false;
									$indicator.removeClass("open");
									$("#tree").get(0).updateScrollbar(true);
									$entry.find("> ul.content").slideUp(function() {

										$("#tree").get(0).updateScrollbar();
									});
								} else {
									path.treeOpen = true;
									$indicator.addClass("open");
									$("#tree").get(0).updateScrollbar(true);
									$entry.find("> ul.content").slideDown(function() {

										$("#tree").get(0).updateScrollbar();
									});
								}

							});

						if (path.status === undefined) {
							$indicator.addClass("unknown");
						} else if (path.treeOpen) {
							$indicator.addClass("open");
						}

						$blank.replaceWith($indicator);
					}

					// is path the domain?
					if (path.isDomain) {
						$html.addClass("domain");
						$a.find(".icon img").attr("src", H5AI.core.icon("folder-home"));
					}

					// is path the current folder?
					if (path.isCurrentFolder) {
						$html.addClass("current");
						$a.find(".icon img").attr("src", H5AI.core.icon("folder-open"));
					}

					// does it have subfolders?
					if (!path.isEmpty()) {
						$ul = $("<ul class='content' />").appendTo($html);
						$.each(path.content, function (idx, entry) {
							$("<li />").append(updateTreeHtml(entry)).appendTo($ul);
						});
						if (path.status === undefined || !path.treeOpen) {
							$ul.hide();
						}
					}

					// reflect folder status
					if (!isNaN(path.status)) {
						if (path.status === 200) {
							$a.find(".icon img").attr("src", H5AI.core.icon("folder-page"));
							$a.append($("<span class='hint'><img src='" + H5AI.core.image("page") + "' /></span>"));
						} else {
							$html.addClass("error");
							$a.append($("<span class='hint'>" + path.status + "</span>"));
						}
					}
				}

				if (path.html.$tree) {
					path.html.$tree.replaceWith($html);
				}
				path.html.$tree = $html;

				return $html;
			},
			updateHtml = function (path) {

				updateCrumbHtml(path);
				updateExtendedHtml(path);
				updateTreeHtml(path);
			};

		return {
			updateCrumbHtml: updateCrumbHtml,
			updateExtendedHtml: updateExtendedHtml,
			updateTreeHtml: updateTreeHtml,
			updateHtml: updateHtml
		};
	}());

}(jQuery, H5AI));
