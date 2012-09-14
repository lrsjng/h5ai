/*
{{pkg.name}} {{pkg.version}}

Configuration
options, types and localization
*/

var H5AI_CONFIG = {

	"options": {

		/*
		The absolute link to h5ai.
		Must point to the "_h5ai" directory.
		*/
		"h5aiAbsHref": "/_h5ai/",

		/*
		Spacing of the main content.
		Left and right will be added to a minimum of 30px. Top and bottom
		are calculated relative to the top and bottom bar heights.
		*/
		"spacing": {
			"maxWidth": 960,
			"top": 50,
			"right": "auto",
			"bottom": 50,
			"left": "auto"
		},

		/*
		An array of view modes the user may choose from. Currently there
		are two possible values: "details" and "icons". The first value
		indicates the default view mode. If only one value is given the
		view mode is fixed and the selector buttons are hidden.
		The user selected view mode is also stored local in modern browsers
		so that it will be persistent.

		Set parent folder labels to real folder names.
		*/
		"view": {
			"modes": ["details", "icons"],
			"setParentFolderLabels": true
		},



		/*** Extensions (in alphabetical order) ***/

		/* [php]
		Watch current folder content.
		Folders possibly visible in the tree view that are not the
		current folder might not be updated.

		Interval will be a least 1000 milliseconds.
		*/
		"autorefresh": {
			"enabled": true,
			"interval": 5000
		},

		/* [all]
		Show a clickable breadcrumb.
		*/
		"crumb": {
			"enabled": true
		},

		/* [all]
		Filenames of customized header and footer files to look for
		in each folder.
		*/
		"custom": {
			"enabled": true,
			"header": "_h5ai.header.html",
			"footer": "_h5ai.footer.html"
		},

		/* [php]
		Allow file deletion.
		*/
		"delete": {
			"enabled": true
		},

		/* [php]
		File upload via drag'n'drop. Folders are not supported.
		The working file size seems to be very browser dependent.

		Max file size is in MB.
		*/
		"dropbox": {
			"enabled": true,
			"maxfiles": 10,
			"maxfilesize": 1000
		},

		/* [php]
		Enable packaged download of selected entries.
		Execution: "php", "shell".
		Supported formats: "tar", "zip".
		*/
		"download": {
			"enabled": true,
			"execution": "php",
			"format": "zip"
		},

		/* [all]
		Allow filtering the displayed files and folders.
		Will check entries for right order of characters, i.e.
		"ab" matches "ab", "axb", "xaxbx" but not "ba".
		Space separated sequences get OR-ed.

		Filters will be treated as JavaScript regular expressions
		if you prefix them with "re:".
		*/
		"filter": {
			"enabled": true
		},

		/* [php]
		Calc the size of folders.
		Depends on du.
		*/
		"foldersize": {
			"enabled": true
		},

		/* [all]
		Associative array of folders and their HTTP status codes to
		avoid HEAD requests to that folders. The key (folder) must start
		and end with a slash (/).
		For example
			"/some/folder/": 200
		will always return HTTP status 200 (OK), which will be interpreted
		as a non auto indexed folder, that means a folder containing an
		appropriate default index file.
		*/
		"folderstatus": {
			"enabled": true,
			"folders": {}
		},

		/* [all]
		Adds Google Analytics asynchronous tracking code.

		for example:
		"gaq": [
			["_setAccount", "UA-xxxxxx-x"],
			["_setDomainName", ".your-domain.tld"],
			["_trackPageview"],
			["_trackPageLoadTime"]
		]

		see: http://support.google.com/googleanalytics/bin/topic.py?hl=en&topic=27612
		*/
		"google-analytics": {
			"enabled": true,
			"gaq": []
		},

		/* [all]
		Localization, for example "en", "de" etc. - see "langs" below for
		possible values. Adjust it to your needs. If lang is not found in
		"langs" it defaults to "en".

		Optionally try to use browser language, falls back to previous
		specified language.
		*/
		"l10n": {
			"enabled": true,
			"lang": "en",
			"useBrowserLang": true
		},

		/* [all]
		Link the hover effects between crumb, main view and tree.
		*/
		"link-hover-states": {
			"enabled": true
		},

		/* [all]
		Shows the server mode in the bottom left corner.
		display values:
			0: only show mode
			1: mode and servername
			2: mode, servername and -version
		*/
		"mode": {
			"enabled": true,
			"display": 2
		},

		/* [all]
		Adds Piwik tracker javascript code.
		*/
		"piwik-analytics": {
			"enabled": false,
			"baseURL": "mydomain.tld/piwik", /* no protocol */
			"idSite": 1
		},

		/* [all]
		Show an image preview on click.
		*/
		"preview-img": {
			"enabled": true,
			"types": ["bmp", "gif", "ico", "image", "jpg", "png", "tiff"]
		},

		/* [all]
		Show text file preview on click.
		"types" maps file types to SyntaxHighligher brushes. Special case: "markdown" will
		be rendered as HTML.

		For available brushes see http://alexgorbatchev.com/SyntaxHighlighter/manual/brushes/
		*/
		"preview-txt": {
			"enabled": true,
			"types": {
				"authors": "plain",
				"copying": "plain",
				"c": "c",
				"cpp": "cpp",
				"css": "css",
				"diff": "diff",
				"h": "c",
				"hpp": "cpp",
				"install": "plain",
				"log": "plain",
				"java": "java",
				"makefile": "xml",
				"markdown": "plain",
				/*"php": "php",*/
				"python": "python",
				"readme": "plain",
				"rb": "ruby",
				"rtf": "plain",
				"script": "shell",
				"text": "plain",
				"js": "js",
				"xml": "xml"
			}
		},

		/* [all]
		Show QRCodes on hovering files.
		*/
		"qrcode": {
			"enabled": true,
			"size": 150
		},

		/* [php]
		Allow to rename files.
		*/
		"rename": {
			"enabled": false
		},

		/* [all]
		Make entries selectable. At the moment only needed for packaged download and delete.
		*/
		"select": {
			"enabled": true
		},

		/* [all]
		Default sort order is a two letter code. The first letter specifies
		the column: "n" for "Name", "d" for "Date" or "s" for "Size". The
		second letter specifies the sort order: "a" for "ascending" or "d"
		for "descending".
		*/
		"sort": {
			"enabled": true,
			"order": "na"
		},

		/* [all]
		Show additional info in a statusbar.
		*/
		"statusbar": {
			"enabled": true
		},

		/* [php]
		Show thumbnails for image files. Needs the "/_h5ai/cache" folder to be
		writable for the web Server.
		- img thumbnails depend on PHP-GD
		- mov thumbnails depend on ffmpeg
		- doc thumbnails depend on convert
		*/
		"thumbnails": {
			"enabled": true,
			"img": ["bmp", "gif", "ico", "image", "jpg", "png", "tiff"],
			"mov": ["video"],
			"doc": ["pdf", "ps"],
			"delay": 1
		},

		/* [all]
		Replace window title with current breadcrumb.
		*/
		"title": {
			"enabled": true
		},

		/* [all]
		Show a folder tree.
		Note that this tree might have side effects as it sends HEAD requests
		to the folders, and therefore will invoke index.php scripts. Use
		"folderstatus" above to avoid such requests.
		It might also affect performance significantly.

		Slide tree bar into viewport if there is enough space.
		*/
		"tree": {
			"enabled": true,
			"slide": true
		}
	},



	/*** File types mapped to file extensions ***/

	"types": {
		"archive":			[".tar.bz2", ".tar.gz", ".tgz"],
		"audio":			[".aif", ".flac", ".m4a", ".mid", ".mp3", ".mpa", ".ra", ".ogg", ".wav", ".wma"],
		"authors":			["authors"],
		"bin":				[".class", ".o", ".so"],
		"blank":			[],
		"bmp":				[".bmp"],
		"c":				[".c"],
		"calc":				[".ods", ".ots", ".xlr", ".xls", ".xlsx"],
		"cd":				[".cue", ".iso"],
		"copying":			["copying", "license"],
		"cpp":				[".cpp"],
		"css":				[".css", ".less"],
		"deb":				[".deb"],
		"default":			[],
		"diff":				[".diff", ".patch"],
		"doc":				[".doc", ".docx", ".odm", ".odt", ".ott"],
		"draw":				[".drw"],
		"eps":				[".eps"],
		"exe":				[".bat", ".cmd", ".exe"],
		"folder":			[],
		"folder-home":		[],
		"folder-open":		[],
		"folder-page":		[],
		"folder-parent":	[],
		"gif":				[".gif"],
		"gzip":				[".gz"],
		"h":				[".h"],
		"hpp":				[".hpp"],
		"html":				[".htm", ".html", ".shtml"],
		"ico":				[".ico"],
		"image":			[".svg", ".xpm"],
		"install":			["install"],
		"java":				[".java"],
		"jpg":				[".jpg", ".jpeg"],
		"js":				[".js", ".json"],
		"log":				[".log", "changelog"],
		"makefile":			[".pom", "build.xml", "pom.xml"],
		"markdown":			[".markdown", ".md"],
		"package":			[],
		"pdf":				[".pdf"],
		"php":				[".php"],
		"playlist":			[".m3u", ".m3u8", ".pls"],
		"png":				[".png"],
		"pres":				[".odp", ".otp", ".pps", ".ppt", ".pptx"],
		"ps":				[".ps"],
		"psd":				[".psd"],
		"py":				[".py"],
		"rar":				[".rar"],
		"rb":				[".rb"],
		"readme":			["readme"],
		"rpm":				[".rpm"],
		"rss":				[".rss"],
		"rtf":				[".rtf"],
		"script":			[".conf", ".csh", ".ini", ".ksh", ".sh", ".shar", ".tcl"],
		"source":			[],
		"sql":				[],
		"tar":				[".tar"],
		"tex":				[".tex"],
		"text":				[".text", ".txt"],
		"tiff":				[".tiff"],
		"unknown":			[],
		"vcal":				[".vcal"],
		"video":			[".avi", ".flv", ".mkv", ".mov", ".mp4", ".mpg", ".rm", ".swf", ".vob", ".wmv"],
		"xml":				[".xml"],
		"zip":				[".7z", ".bz2", ".jar", ".lzma", ".war", ".z", ".Z", ".zip"]
	},



	/*** Available translations ***/

	"langs": {
		/* defaults */
		"en": "english",

		"bg": "български",
		"cs": "čeština",
		"de": "deutsch",
		"el": "ελληνικά",
		"es": "español",
		"fr": "français",
		"he": "עברית",
		"hu": "magyar",
		"it": "italiano",
		"ja": "日本語",
		"lv": "latviešu",
		"nb": "norwegian",
		"nl": "nederlands",
		"pl": "polski",
		"pt": "português",
		"ro": "română",
		"ru": "русский",
		"sk": "slovenčina",
		"sr": "srpski",
		"sv": "svenska",
		"tr": "türkçe",
		"zh-cn": "简体中文",
		"zh-tw": "正體中文"
	}
};
