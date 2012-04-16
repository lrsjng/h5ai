/*
 * h5ai %BUILD_VERSION%
 *
 * Configuration
 * options, types and localization
 */

var H5AI_CONFIG = {

	"options": {

		/*
		 * The absolute links to webroot and h5ai.
		 * Do not change this unless you know what you are doing.
		 */
		"rootAbsHref": "/",
		"h5aiAbsHref": "/_h5ai/",

		/*
		 * Spacing of the main content.
		 * Left and right will be added to a minimum of 30px. Top and bottom
		 * are calculated relative to the top and bottom bar heights.
		 */
		"spacing": {
			"maxWidth": 960,
			"top": 50,
			"right": "auto",
			"bottom": 50,
			"left": "auto"
		},

		/*
		 * An array of view modes the user may choose from. Currently there
		 * are two possible values: "details" and "icons". The first value
		 * indicates the default view mode. If only one value is given the
		 * view mode is fixed and the selector buttons are hidden.
		 * The user selected view mode is also stored local in modern browsers
		 * so that it will be persistent.
		 *
		 * Set parent folder labels to real folder names.
		 */
		"view": {
			"modes": ["details", "icons"],
			"setParentFolderLabels": true
		},




		/*
		 * Extensions in alphabetical order.
		 */

		/*
		 * Show a clickable breadcrumb.
		 */
		"crumb": {
			"enabled": true
		},

		/*
		 * Filenames of customized header and footer files to look for
		 * in each folder.
		 */
		"custom": {
			"enabled": true,
			"header": "_h5ai.header.html",
			"footer": "_h5ai.footer.html"
		},

		/*
		 * Allow filtering the displayed files and folders.
		 * Note: filters will be treated as JavaScript regular expressions
		 * if you prefix them with "re:".
		 */
		"filter": {
			"enabled": true
		},

		/*
		 * Associative array of folders and their HTTP status codes to
		 * avoid HEAD requests to that folders. The key (folder) must start
		 * and end with a slash (/).
		 * For example
		 *   "/some/folder/": 200
		 * will always return HTTP status 200 (OK), which will be interpreted
		 * as a non auto indexed folder, that means a folder containing an
		 * appropriate default index file.
		 */
		"folderstatus": {
			"enabled": true,
			"folders": {}
		},

		/*
		 * Localization, for example "en", "de" etc. - see "langs" below for
		 * possible values. Adjust it to your needs. If lang is not found in
		 * "langs" it defaults to "en".
		 *
		 * Optionally try to use browser language, falls back to previous
		 * specified language.
		 *
		 * Date format in detailed view, for example: "YYYY-MM-DD HH:mm:ss"
		 * Syntax as specified by Moment.js (http://momentjs.com)
		 * This might be overidden by "dateFormat" in a lang specification.
		 */
		"l10n": {
			"enabled": true,
			"lang": "en",
			"useBrowserLang": true,
			"defaultDateFormat": "YYYY-MM-DD HH:mm"
		},

		/*
		 * Link the hover effects between crumb, main view and tree.
		 */
		"link-hover-states": {
			"enabled": true
		},

		/*
		 * Show QRCodes on hovering files.
		 */
		"qrcode": {
			"enabled": true,
			"size": 150
		},

		/*
		 * Make entries selectable. At the moment only needed for zipped download.
		 */
		"select": {
			"enabled": true
		},

		/*
		 * Default sort order is a two letter code. The first letter specifies
		 * the column: "n" for "Name", "d" for "Date" or "s" for "Size". The
		 * second letter specifies the sort order: "a" for "ascending" or "d"
		 * for "descending".
		 */
		"sort": {
			"enabled": true,
			"order": "na"
		},

		/*
		 * Show additional info in a statusbar.
		 */
		"statusbar": {
			"enabled": true
		},

		/*
		 * Requires PHP on the server.
		 * Show thumbnails for image files. Needs the "/_h5ai/cache" folder to be
		 * writable for the Apache Server.
		 */
		"thumbnails": {
			"enabled": true,
			"types": ["bmp", "gif", "ico", "image", "jpg", "png", "tiff"],
			"delay": 1000
		},

		/*
		 * Replace window title with current breadcrumb.
		 */
		"title": {
			"enabled": true
		},

		/*
		 * Show a folder tree.
		 * Note that this tree might have side effects as it sends HEAD requests
		 * to the folders, and therefore will invoke index.php scripts. Use
		 * "folderstatus" above to avoid such requests.
		 * It might also affect performance significantly.
		 *
		 * Slide tree bar into viewport if there is enough space.
		 */
		"tree": {
			"enabled": true,
			"slide": true
		},

		/*
		 * Requires PHP on the server.
		 * Enable zipped download of selected entries.
		 */
		"zipped-download": {
			"enabled": true
		}
	},


	/*
	 * File types mapped to file extensions. In alphabetical order.
	 */
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
		"image":			[".xpm"],
		"install":			["install"],
		"java":				[".java"],
		"jpg":				[".jpg", ".jpeg"],
		"js":				[".js", ".json"],
		"log":				[".log", "changelog"],
		"makefile":			[".pom", "build.xml", "pom.xml"],
		"package":			[],
		"pdf":				[".pdf"],
		"php":				[".php"],
		"playlist":			[".m3u", ".m3u8", ".pls"],
		"png":				[".png"],
		"pres":				[".odp", ".otp", ".pps", ".ppt", ".pptx"],
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
		"text":				[".diff", ".markdown", ".md", ".patch", ".text", ".txt"],
		"tiff":				[".tiff"],
		"unknown":			[],
		"vcal":				[".vcal"],
		"video":			[".avi", ".flv", ".mkv", ".mov", ".mp4", ".mpg", ".rm", ".swf", ".vob", ".wmv"],
		"xml":				[".xml"],
		"zip":				[".7z", ".bz2", ".jar", ".lzma", ".war", ".z", ".Z", ".zip"]
	},


	/*
	 * Available translations. "en" in first place as a reference, otherwise in alphabetical order.
	 */
	"langs": {

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
			"noMatch": "no match"
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
			"files": "файлове",
			"download": "download",
			"noMatch": "no match"
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
			"download": "download",
			"noMatch": "no match"
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
			"dateFormat": "DD.MM.YYYY HH:mm"
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
			"download": "Descargar",
			"noMatch": "no match"
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
			"noMatch": "no match"
		},

		"gr": {
			"lang": "ελληνικά",
			"details": "Λεπτομέρειες",
			"icons": "Εικονίδια",
			"name": "Όνομα",
			"lastModified": "Τελευταία Τροποποίηση",
			"size": "Μέγεθος",
			"parentDirectory": "Προηγούμενος Κατάλογος",
			"empty": "κενό",
			"folders": "Φάκελοι",
			"files": "Αρχεία",
			"download": "Μεταμόρφωση",
			"noMatch": "Κανένα Ταίριασμα"
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
			"files": "file",
			"download": "download",
			"noMatch": "no match"
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
			"noMatch": "nav sakritības"
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
			"empty": "lege",
			"folders": "folders",
			"files": "files",
			"download": "download",
			"noMatch": "no match"
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
			"files": "pliki",
			"download": "download",
			"noMatch": "no match"
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
			"files": "arquivos",
			"download": "download",
			"noMatch": "no match"
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
			"files": "файлы",
			"download": "download",
			"noMatch": "no match"
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
			"files": "súborov",
			"download": "download",
			"noMatch": "no match"
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
			"empty": "tom",
			"folders": "folders",
			"files": "files",
			"download": "download",
			"noMatch": "no match"
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
			"download": "indir",
			"noMatch": "no match"
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
			"download": "下载",
			"noMatch": "no match"
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
			"download": "下載",
			"noMatch": "no match"
		}
	}
};
