
(function ($, h5ai) {

	var x = 0,
		y = 0,
		$document = $(document),
		$selectionRect = $("#selection-rect"),
		selectedHrefsStr = "",
		$download, $img, $downloadAuth, $downloadUser, $downloadPassword,

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
				$downloadAuth.hide();
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

			var view = $(document).fracs('viewport');

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
		failed = function () {

			$download.addClass('failed');
			setTimeout(function () {
				$download.removeClass('failed');
			}, 1000);
		},
		handleResponse = function (response) {


			$download.removeClass('current');
			$img.attr('src', h5ai.core.image("download"));

			if (response) {
				if (response.status === 'ok') {
					window.location = h5ai.core.api() + '?action=getzip&id=' + response.id;
				} else {
					if (response.code === 401) {
						$downloadAuth
							.css({
								left: $download.offset().left,
								top: $download.offset().top + $download.outerHeight()
							})
							.show();
						$downloadUser.focus();
					}
					failed();
				}
			} else {
				failed();
			}
		},
		requestZipping = function (hrefsStr) {

			$download.addClass('current');
			$img.attr('src', h5ai.core.image("loading.gif", true));
			$.ajax({
				url: h5ai.core.api(),
				data: {
					action: 'zip',
					hrefs: selectedHrefsStr
				},
				type: 'POST',
				dataType: 'json',
				beforeSend: function (xhr) {

					var user = $downloadUser.val(),
						password = $downloadPassword.val();

					if (user) {
						xhr.setRequestHeader ('Authorization', 'Basic ' + Base64.encode(user + ':' + password));
					}
				},
				success: function (response) {

					handleResponse(response);
				},
				failed: function () {

					handleResponse();
				}
			});
		},
		init = function () {

			if (h5ai.core.settings.zippedDownload) {
				$("<li id='download'><a href='#'><img alt='download' /><span class='l10n-download'>download</span></a></li>")
					.find("img").attr("src", h5ai.core.image("download")).end()
					.find("a").click(function (event) {

						event.preventDefault();
						$downloadAuth.hide();
						requestZipping(selectedHrefsStr);
					}).end()
					.appendTo($("#navbar"));
				$("<div id='download-auth'><input id='download-auth-user' type='text' value='' placeholder='user' /><input id='download-auth-password' type='text' value='' placeholder='password' /></div>")
					.appendTo($("body"));

				$download = $('#download');
				$downloadAuth = $('#download-auth');
				$downloadUser = $('#download-auth-user');
				$downloadPassword = $('#download-auth-password');
				$img = $download.find('img');

				$("body>nav,body>footer,#tree,input").on("mousedown", noSelection);
				$("#content").on("mousedown", "a", noSelectionUnlessCtrl);
				$document.on("mousedown", selectionStart);
			}
		};

	h5ai.zippedDownload = {
		init: init
	};

}(jQuery, h5ai));
