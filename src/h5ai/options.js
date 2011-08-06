/*
 * h5ai %BUILD_VERSION%
 * Options and localization 
 */

h5aiOptions = {

	/*
	 * An array of view modes the user may choose from. Currently there
	 * are two possible values: "details" and "icons". The first value
	 * indicates the default view mode. If only one value is given the
	 * view mode is fixed and the selector buttons are hidden.
	 * The user selected view mode is also stored local in modern browsers
	 * so that it will be persistent.
	 */
	"viewmodes": [ "details", "icons" ],

	/*
	 * Show a folder tree, boolean.
	 * Note that this tree might have side effects as it sends HEAD requests
	 * to the folders, and therefore will invoke index.php scripts. Use
	 * folderStatus below to avoid such requests.
	 * It might also affect performance significantly.
	 */
	"showTree": true,

	/*
	 * Associative array of folders and their HTTP status codes to
	 * avoid HEAD requests to that folders. The key (folder) must start
	 * and end with a slash (/).
	 * For example:
	 *   "/some/folder/": 200
	 * will always return HTTP status 200 (OK), which will be interpreted
	 * as a non auto indexed folder, that means a folder containing an
	 * appropriate default index file.
	 */
	"folderStatus": {
		/*
		 * for example:
		 * "/some/folder/": 200
		 */
	},

	/*
	 * Localization, for example "en", "de" etc. - see h5aiLangs below for
	 * possible values. Adjust it to your needs. If lang is not found in
	 * h5aiLangs it defaults to "en".
	 */
	"lang": null,

	/*
	 * Try to use browser language, falls back to previous specified lang. 
	 */
	"useBrowserLang": true,
	
	/*
	 * Set parent folder labels to real folder names.
	 */
	"setParentFolderLabels": true,
	
	/*
	 * Link the hover effects between crumb, extended view and tree.
	 */
	"linkHoverStates": true,

	/*
	 * Only used in PHP implementation.
	 * Date format in PHP syntax, for example: "Y-m-d H:i:s"
	 * http://www.php.net/manual/en/function.date.php
	 */
	"dateFormat": "Y-m-d H:i",

	/*
	 * Only used in PHP implementation.
	 * Files/folders that should never be listed. Specified
	 * by the complete filename or by a regular expression.
	 * http://www.php.net/manual/en/function.preg-match.php
	 */
	"ignore": [ "h5ai", "h5ai.header.html", "h5ai.footer.html" ],
	"ignoreRE": [ "/^\\./" ]
};



/*
 * Available translations.
*/
h5aiLangs = {

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
		"files": "files"
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
		"files": "Dateien"
	},
	
	"fr": {
		"lang": "française",
		"details": "détails",
		"icons": "icônes",
		"name": "Nom",
		"lastModified": "Dernière modification",
		"size": "Taille",
		"parentDirectory": "Dossier parent",
		"empty": "vide",
		"folders": "[?folders?]",
		"files": "[?files?]"
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
		"folders": "[?folders?]",
		"files": "[?files?]"
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
		"folders": "[?folders?]",
		"files": "[?files?]"
	},

	"cs": {
		"lang": "[?lang?]",
		"details": "podrobnosti",
		"icons": "ikony",
		"name": "Název",
		"lastModified": "Upraveno",
		"size": "Velikost",
		"parentDirectory": "Nadřazený adresář",
		"empty": "prázdný",
		"folders": "[?folders?]",
		"files": "[?files?]"
	},

	"sk": {
		"lang": "[?lang?]",
		"details": "podrobnosti",
		"icons": "ikony",
		"name": "Názov",
		"lastModified": "Upravené",
		"size": "Velkosť",
		"parentDirectory": "Nadriadený priečinok",
		"empty": "prázdny",
		"folders": "[?folders?]",
		"files": "[?files?]"
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
		"folders": "[?folders?]",
		"files": "[?files?]"
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
		"folders": "[?folders?]",
		"files": "[?files?]"
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
		"folders": "[?folders?]",
		"files": "[?files?]"
	},

	"bg": {
		"lang": "[?lang?]",
		"details": "детайли",
		"icons": "икони",
		"name": "Име",
		"lastModified": "Последна промяна",
		"size": "Размер",
		"parentDirectory": "Предходна директория",
		"empty": "празно",
		"folders": "[?folders?]",
		"files": "[?files?]"
	}
};
