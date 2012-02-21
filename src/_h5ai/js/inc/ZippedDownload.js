
(function ($, H5AI) {

	H5AI.zippedDownload = (function () {

		var x = 0,
			y = 0,
			$document = $(document),
			$selectionRect = $("#selection-rect"),
			selectedHrefsStr = "",
			updateDownloadBtn = function () {

				var $selected = $("#extended a.selected"),
					$downloadBtn = $("#download");

				selectedHrefsStr = "";
				if ($selected.length) {
					$selected.each(function () {

						var href = $(this).attr("href");
						selectedHrefsStr = selectedHrefsStr ? selectedHrefsStr + ":" + href : href;
					});
					$downloadBtn.show();
				} else {
					$downloadBtn.hide();
				}
			},
			selectionUpdate = function (event) {

				var l = Math.min(x, event.pageX),
					t = Math.min(y, event.pageY),
					w = Math.abs(x - event.pageX),
					h = Math.abs(y - event.pageY),
					selRect;

				event.preventDefault();
				$selectionRect.css({left: l, top: t, width: w, height: h});

				selRect = $selectionRect.fracs("rect");
				$("#extended a").removeClass("selecting").each(function () {

					var $a = $(this),
						rect = $a.fracs("rect"),
						inter = selRect.intersection(rect);
					if (inter && !$a.closest(".entry").hasClass("folder-parent")) {
						$a.addClass("selecting");
					}
				});
			},
			selectionEnd = function (event) {

				event.preventDefault();
				$document.off("mousemove", selectionUpdate);
				$selectionRect.hide().css({left: 0, top: 0, width: 0, height: 0});
				$("#extended a.selecting.selected").removeClass("selecting").removeClass("selected");
				$("#extended a.selecting").removeClass("selecting").addClass("selected");
				updateDownloadBtn();
			},
			selectionStart = function (event) {

				var view = $.fracs.viewport();

				x = event.pageX;
				y = event.pageY;
				// only on left button and don't block the scrollbars
				if (event.button !== 0 || x >= view.right || y >= view.bottom) {
					return;
				}

				event.preventDefault();
				$(':focus').blur();
				if (!event.ctrlKey) {
					$("#extended a").removeClass("selected");
					updateDownloadBtn();
				}
				$selectionRect.show().css({left: x, top: y, width: 0, height: 0});

				$document
					.on("mousemove", selectionUpdate)
					.one("mouseup", selectionEnd);
			},
			noSelection = function (event) {

				event.stopImmediatePropagation();
				return false;
			},
			noSelectionUnlessCtrl = function (event) {

				if (!event.ctrlKey) {
					noSelection(event);
				}
			},
			init = function () {

				if (H5AI.core.settings.zippedDownload) {
					$("<li id='download'><a href='#'><img alt='download' /><span class='l10n-download'>download</span></a></li>")
						.find("img").attr("src", H5AI.core.image("download")).end()
						.find("a").click(function () {

							$('#download').addClass('zipping');
							$('#download img').attr('src', H5AI.core.image("loading.gif", true));
							$.ajax({
								url: H5AI.core.api(),
								data: {
									action: 'zip',
									hrefs: selectedHrefsStr
								},
								type: 'POST',
								dataType: 'json',
								success: function (response) {

									$('#download img').attr('src', H5AI.core.image("download"));
									$('#download').removeClass('zipping');
									if (response.status === 'ok') {
										window.location = H5AI.core.api() + '?action=getzip&id=' + response.id;
									} else {
										$('#download').addClass('failed');
										setTimeout(function () {
											$('#download').removeClass('failed');
										}, 1000);
									}
								},
								failed: function () {
									$('#download img').attr('src', H5AI.core.image("download"));
									$('#download').removeClass('zipping');
								}
							});
						}).end()
						.appendTo($("#navbar"));

					$("body>nav,body>footer,#tree").on("mousedown", noSelection);
					$("#content").on("mousedown", "a", noSelectionUnlessCtrl);
					$document.on("mousedown", selectionStart);
				}
			};

		return {
			init: init
		};
	}());

}(jQuery, H5AI));
