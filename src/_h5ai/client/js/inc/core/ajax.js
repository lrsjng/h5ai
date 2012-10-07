
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
					action: 'get',
					checks: true
				},
				type: 'POST',
				dataType: 'json',
				success: function (json) {

					callback(json.checks);
				},
				error: function () {

					callback();
				}
			});
		},

		getEntries = function (href, what, callback) {

			$.ajax({
				url: resource.api(),
				data: {
					action: 'get',
					entries: true,
					entriesHref: href,
					entriesWhat: what
				},
				type: 'POST',
				dataType: 'json',
				success: function (json) {

					callback(json.entries);
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

		getHtml = function (url, callback) {

			$.ajax({
				url: url,
				type: 'POST',
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
		getEntries: getEntries,
		getArchive: getArchive,
		getHtml: getHtml
	};
});
