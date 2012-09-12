
modulejs.define('ext/piwik-analytics', ['_', 'core/settings'], function (_, allsettings) {

	var defaults = {
			enabled: false,
			piwik: {
				"baseURL": "not-set",
				"idSite": 0
			}
		},

		template = function(baseURL, idSite) {

			return '<script type="text/javascript">
						var pkBaseURL = (("https:" == document.location.protocol) ? "https://'+baseURL+'" : "http://'+baseURL+'");
						document.write(unescape("%3Cscript src='" + pkBaseURL + "piwik.js' type='text/javascript'%3E%3C/script%3E"));
					</script><script type="text/javascript">
						try {
							var piwikTracker = Piwik.getTracker(pkBaseURL + "piwik.php", '+idSite+');
							piwikTracker.trackPageView();
							piwikTracker.enableLinkTracking();
						} catch( err ) {}
					</script><noscript><p><img src="http://analytics.bluepyth.fr/piwik.php?idsite='+idSite+'" style="border:0" alt="" /></p></noscript>'
		}

		settings = _.extend({}, defaults, allsettings['piwik-analytics']),

		init = function () {

			if (!settings.enabled) {
				return;
			}

			var $body = $('body');

			body.append(template(settings.baseURL, settings.idSite));
		};

	init();
});
