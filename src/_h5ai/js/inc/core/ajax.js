
modulejs.define('core/ajax', ['$', 'amplify', 'base64', 'core/resource'], function ($, amplify, base64, resource) {

	var reContentType = /^text\/html;h5ai=/,

		getStatus = function (href, withContent, callback) {

			$.ajax({
				url: href,
				type: withContent ? 'GET' : 'HEAD',
				complete: function (xhr) {

					var res = {
						status: xhr.status,
						content: xhr.responseText
					};

					if (xhr.status === 200 && reContentType.test(xhr.getResponseHeader('Content-Type'))) {
						res.status = 'h5ai';
					}

					callback(res);
				}
			});
		},

		getChecks = function (callback) {

			$.ajax({
				url: resource.api(),
				data: {
					action: 'getchecks'
				},
				type: 'POST',
				dataType: 'json',
				success: function (json) {

					callback(json);
				},
				error: function () {

					callback();
				}
			});
		},

		getArchive = function (data, callback) {

			$.ajax({
				url: resource.api(),
				data: {
					action: 'archive',
					execution: data.execution,
					format: data.format,
					hrefs: data.hrefs
				},
				type: 'POST',
				dataType: 'json',
				beforeSend: function (xhr) {

					if (data.user) {
						xhr.setRequestHeader('Authorization', 'Basic ' + base64.encode(data.user + ':' + data.password));
					}
				},
				success: function (json) {

					callback(json);
				},
				error: function () {

					callback();
				}
			});
		},

		getThumbSrc = function (data, callback) {

			$.ajax({
				url: resource.api(),
				data: {
					action: 'getthumbsrc',
					type: data.type,
					href: data.href,
					mode: data.mode,
					width: data.width,
					height: data.height
				},
				type: 'POST',
				dataType: 'json',
				success: function (json) {

					if (json.code === 0) {
						callback(json.absHref);
					}
					callback();
				},
				error: function () {

					callback();
				}
			});
		},

		getThumbSrcSmall = function (type, href, callback) {

			getThumbSrc(
				{
					type: type,
					href: href,
					mode: 'square',
					width: 16,
					height: 16
				},
				callback
			);
		},

		getThumbSrcBig = function (type, href, callback) {

			getThumbSrc(
				{
					type: type,
					href: href,
					mode: 'rational',
					width: 100,
					height: 48
				},
				callback
			);
		},

		getHtml = function (url, callback) {

			$.ajax({
				url: url,
				dataType: 'html',
				success: function (html) {

					callback(html);
				},
				error: function () {

					callback();
				}
			});
		};


	return {
		getStatus: getStatus,
		getChecks: getChecks,
		getArchive: getArchive,
		getThumbSrcSmall: getThumbSrcSmall,
		getThumbSrcBig: getThumbSrcBig,
		getHtml: getHtml
	};
});
