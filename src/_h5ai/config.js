/*
h5ai {{version}}

Configuration
options, types and localization
*/

var H5AI_CONFIG = {

	"options": {

		/*
		The absolute links to webroot and h5ai.
		Do not change this unless you know what you are doing.
		*/
		"rootAbsHref": "/",
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

		/*
		Watch current folder content.
		Folders possibly visible in the tree view that are not the
		current folder might not be updated.

		Interval will be a least 1000 milliseconds.
		*/
		"autoupdate": {
			"enabled": true,
			"interval": 1000
		},

		/*
		Show a clickable breadcrumb.
		*/
		"crumb": {
			"enabled": true
		},

		/*
		Filenames of customized header and footer files to look for
		in each folder.
		*/
		"custom": {
			"enabled": true,
			"header": "_h5ai.header.html",
			"footer": "_h5ai.footer.html"
		},

		/*
		Allow file deletion.
		*/
		"delete": {
			"enabled": true
		},

		/*
		File upload via drag'n'drop. Folders are not supported.
		The working file size seems to be very broser dependent.

		Max file size is in MB.
		*/
		"dropbox": {
			"enabled": true,
			"maxfiles": 50,
			"maxfilesize": 2000
		},

		/*
		Requires PHP on the server.
		Enable packaged download of selected entries.
		Execution: "php", "shell".
		Supported formats: "tar", "zip".
		*/
		"download": {
			"enabled": true,
			"execution": "shell",
			"format": "zip"
		},

		/*
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

		/*
		Requires PHP on the server.
		Calc the size of folders.
		Depends on du.
		*/
		"foldersize": {
			"enabled": true
		},

		/*
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

		/*
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

		/*
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

		/*
		Link the hover effects between crumb, main view and tree.
		*/
		"link-hover-states": {
			"enabled": true
		},

		/*
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

		/*
		Show an image preview on click.
		*/
		"preview-img": {
			"enabled": true,
			"types": ["bmp", "gif", "ico", "image", "jpg", "png", "tiff"]
		},

		/*
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

		/*
		Show QRCodes on hovering files.
		*/
		"qrcode": {
			"enabled": true,
			"size": 150
		},

		/*
		Make entries selectable. At the moment only needed for packaged download.
		*/
		"select": {
			"enabled": true
		},

		/*
		Default sort order is a two letter code. The first letter specifies
		the column: "n" for "Name", "d" for "Date" or "s" for "Size". The
		second letter specifies the sort order: "a" for "ascending" or "d"
		for "descending".
		*/
		"sort": {
			"enabled": true,
			"order": "na"
		},

		/*
		Show additional info in a statusbar.
		*/
		"statusbar": {
			"enabled": true
		},

		/*
		Requires PHP on the server.
		Show thumbnails for image files. Needs the "/_h5ai/cache" folder to be
		writable for the Apache Server.
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

		/*
		Replace window title with current breadcrumb.
		*/
		"title": {
			"enabled": true
		},

		/*
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



	/*** File types mapped to file extensions. In alphabetical order. ***/

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



	/*** Available translations. ***/

	"langs": {

		/* "en" in first place as a reference, otherwise in alphabetical order. */
		"en": {
			"lang": "english",
			"details": "details",
			"icons": "icons",
			"name": "Name",
			"lastModified": "Last modified",
			"size": "Size",
			"parentDirectory": "Parent Directory",
			"empty": "empty",
			"folders": "folders",
			"files": "files",
			"download": "download",
			"noMatch": "no match",
			"dateFormat": "YYYY-MM-DD HH:mm", /* syntax as specified on http://momentjs.com */
			"filter": "filter",
			"delete": "delete"
		},

		"bg": {
			"lang": "български",
			"details": "детайли",
			"icons": "икони",
			"name": "Име",
			"lastModified": "Последна промяна",
			"size": "Размер",
			"parentDirectory": "Предходна директория",
			"empty": "празно",
			"folders": "папки",
			"files": "файлове"
		},

		"cs": {
			"lang": "čeština",
			"details": "podrobnosti",
			"icons": "ikony",
			"name": "Název",
			"lastModified": "Upraveno",
			"size": "Velikost",
			"parentDirectory": "Nadřazený adresář",
			"empty": "prázdný",
			"folders": "složek",
			"files": "souborů",
			"download": "stáhnout",
			"noMatch": "žádná shoda",
			"dateFormat": "DD.MM.YYYY HH:mm",
			"filter": "filtr"
		},

		"de": {
			"lang": "deutsch",
			"details": "Details",
			"icons": "Icons",
			"name": "Name",
			"lastModified": "Geändert",
			"size": "Größe",
			"parentDirectory": "Übergeordnetes Verzeichnis",
			"empty": "leer",
			"folders": "Ordner",
			"files": "Dateien",
			"download": "Download",
			"noMatch": "keine Treffer",
			"dateFormat": "DD.MM.YYYY HH:mm",
			"filter": "Filter",
			"delete": "Löschen"
		},

		"el": {
			"lang": "ελληνικά",
			"details": "λεπτομέρειες",
			"icons": "εικονίδια",
			"name": "Όνομα",
			"lastModified": "Τελευταία τροποποίηση",
			"size": "Μέγεθος",
			"parentDirectory": "Προηγούμενος Κατάλογος",
			"empty": "κενό",
			"folders": "φάκελοι",
			"files": "αρχεία",
			"download": "μεταμόρφωση",
			"noMatch": "κανένα αποτέλεσμα",
			"dateFormat": "DD/MM/YYYY HH:mm",
			"filter": "φίλτρο"
		},

		"es": {
			"lang": "español",
			"details": "Detalles",
			"icons": "Íconos",
			"name": "Nombre",
			"lastModified": "Última modificación",
			"size": "Tamaño",
			"parentDirectory": "Directorio superior",
			"empty": "vacío",
			"folders": "Directorios",
			"files": "Archivos",
			"download": "Descargar"
		},

		"fr": {
			"lang": "français",
			"details": "détails",
			"icons": "icônes",
			"name": "Nom",
			"lastModified": "Dernière modification",
			"size": "Taille",
			"parentDirectory": "Dossier parent",
			"empty": "vide",
			"folders": "Répertoires",
			"files": "Fichiers",
			"download": "télécharger",
			"noMatch": "rien trouvé",
			"dateFormat": "DD/MM/YYYY HH:mm"
		},

		"hu": {
			"lang": "magyar",
			"details": "részletek",
			"icons": "ikonok",
			"name": "Név",
			"lastModified": "Utoljára módosítva",
			"size": "Méret",
			"parentDirectory": "Szülő könyvtár",
			"empty": "üres",
			"folders": "mappák",
			"files": "fájlok",
			"download": "letöltés",
			"noMatch": "nincs találat",
			"dateFormat": "YYYY-MM-DD HH:mm"
		},

		"it": {
			"lang": "italiano",
			"details": "dettagli",
			"icons": "icone",
			"name": "Nome",
			"lastModified": "Ultima modifica",
			"size": "Dimensione",
			"parentDirectory": "Cartella Superiore",
			"empty": "vuota",
			"folders": "cartelle",
			"files": "file"
		},

		"ja": {
			"lang": "日本語",
			"details": "詳細",
			"icons": "アイコン",
			"name": "名前",
			"lastModified": "変更日",
			"size": "サイズ",
			"parentDirectory": "親フォルダ",
			"empty": "項目なし",
			"folders": "フォルダ",
			"files": "ファイル",
			"download": "ダウンロード",
			"noMatch": "一致なし"
		},

		"lv": {
			"lang": "latviešu",
			"details": "detaļas",
			"icons": "ikonas",
			"name": "Nosaukums",
			"lastModified": "Pēdējoreiz modificēts",
			"size": "Izmērs",
			"parentDirectory": "Vecākdirektorijs",
			"empty": "tukšs",
			"folders": "mapes",
			"files": "faili",
			"download": "lejupielādēt",
			"noMatch": "nav sakritības",
			"dateFormat": "YYYY-MM-DD HH:mm"
		},

		"nb": {
			"lang": "norwegian",
			"details": "detaljer",
			"icons": "ikoner",
			"name": "Navn",
			"lastModified": "Sist endret",
			"size": "Størrelse",
			"parentDirectory": "Overordnet mappe",
			"empty": "tom",
			"folders": "mapper",
			"files": "filer",
			"download": "last ned",
			"noMatch": "ingen treff"
		},

		"nl": {
			"lang": "nederlands",
			"details": "details",
			"icons": "iconen",
			"name": "Naam",
			"lastModified": "Laatste wijziging",
			"size": "Grootte",
			"parentDirectory": "Bovenliggende map",
			"empty": "lege"
		},

		"pl": {
			"lang": "polski",
			"details": "szczegóły",
			"icons": "ikony",
			"name": "Nazwa",
			"lastModified": "Ostatnia modyfikacja",
			"size": "Rozmiar",
			"parentDirectory": "Katalog nadrzędny",
			"empty": "pusty",
			"folders": "foldery",
			"files": "pliki"
		},

		"pt": {
			"lang": "português",
			"details": "detalhes",
			"icons": "ícones",
			"name": "Nome",
			"lastModified": "Última modificação",
			"size": "Tamanho",
			"parentDirectory": "Diretório superior",
			"empty": "vazio",
			"folders": "pastas",
			"files": "arquivos"
		},

		"ro": {
			"lang": "română",
			"details": "detalii",
			"icons": "pictograme",
			"name": "nume",
			"lastModified": "ultima modificare",
			"size": "mărime",
			"parentDirectory": "dosar părinte",
			"empty": "gol",
			"folders": "dosar",
			"files": "fişiere",
			"download": "descarcă",
			"noMatch": "0 rezultate"
		},

		"ru": {
			"lang": "русский",
			"details": "детали",
			"icons": "иконки",
			"name": "Имя",
			"lastModified": "Последние изменения",
			"size": "Размер",
			"parentDirectory": "Главная директория",
			"empty": "пусто",
			"folders": "папки",
			"files": "файлы"
		},

		"sk": {
			"lang": "slovenčina",
			"details": "podrobnosti",
			"icons": "ikony",
			"name": "Názov",
			"lastModified": "Upravené",
			"size": "Velkosť",
			"parentDirectory": "Nadriadený priečinok",
			"empty": "prázdny",
			"folders": "priečinkov",
			"files": "súborov"
		},

		"sr": {
			"lang": "srpski",
			"details": "detalji",
			"icons": "ikone",
			"name": "Ime",
			"lastModified": "Poslednja modifikacija",
			"size": "Veličina",
			"parentDirectory": "Roditeljski direktorijum",
			"empty": "prazno",
			"folders": "direktorijum",
			"files": "fajlovi",
			"download": "download",
			"noMatch": "bez poklapanja"
		},

		"sv": {
			"lang": "svenska",
			"details": "detaljerad",
			"icons": "ikoner",
			"name": "Filnamn",
			"lastModified": "Senast ändrad",
			"size": "Filstorlek",
			"parentDirectory": "Till överordnad mapp",
			"empty": "tom"
		},

		"tr": {
			"lang": "türkçe",
			"details": "detaylar",
			"icons": "ikonlar",
			"name": "İsim",
			"lastModified": "Son Düzenleme",
			"size": "Boyut",
			"parentDirectory": "Üst Dizin",
			"empty": "boş",
			"folders": "klasörler",
			"files": "dosyalar",
			"download": "indir"
		},

		"zh-cn": {
			"lang": "简体中文",
			"details": "详情",
			"icons": "图标",
			"name": "文件名",
			"lastModified": "上次修改",
			"size": "大小",
			"parentDirectory": "上层文件夹",
			"empty": "空文件夹",
			"folders": "文件夹",
			"files": "文件",
			"download": "下载"
		},

		"zh-tw": {
			"lang": "正體中文",
			"details": "詳細資料",
			"icons": "圖示",
			"name": "檔名",
			"lastModified": "上次修改",
			"size": "大小",
			"parentDirectory": "上層目錄",
			"empty": "空資料夾",
			"folders": "資料夾",
			"files": "檔案",
			"download": "下載"
		}
	}
};
