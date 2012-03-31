
Module.define('config', [jQuery, H5AI_CONFIG], function ($, config) {

	var defaults = {
			store: {
				viewmode: 'h5ai.pref.viewmode',
				lang: 'h5ai.pref.lang'
			},
			callbacks: {
				pathClick: []
			},

			rootAbsHref: '/',
			h5aiAbsHref: '/_h5ai/',
			customHeader: null,
			customFooter: null,
			viewmodes: ['details', 'icons'],
			sortorder: 'na',
			showTree: true,
			slideTree: true,
			folderStatus: {},
			lang: 'en',
			useBrowserLang: true,
			setParentFolderLabels: true,
			linkHoverStates: true,
			dateFormat: 'yyyy-MM-dd HH:mm',
			showThumbs: false,
			thumbTypes: ['bmp', 'gif', 'ico', 'image', 'jpg', 'png', 'tiff'],
			zippedDownload: false,
			qrCodesSize: null,
			showFilter: false
		};

	return {
		settings: $.extend({}, defaults, config.options),
		types: $.extend({}, config.types),
		langs: $.extend({}, config.langs)
	};
});


Module.define('settings', ['config'], function (config) {

	return config.settings;
});


Module.define('types', ['config'], function (config) {

	return config.types;
});


Module.define('langs', ['config'], function (config) {

	return config.langs;
});
