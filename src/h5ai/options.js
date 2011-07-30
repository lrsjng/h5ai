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
	viewmodes: [ "details", "icons" ],

	/*
	 * Show a folder tree, boolean.
	 * Note that this tree might have side effects as it sends HEAD requests
	 * to the folders, and therefore will invoke index.php scripts. Use
	 * folderStatus below to avoid such requests.
	 * It might also affect performance significantly.
	 */
	showTree: true,

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
	folderStatus: {
		/*
		 * for example:
		 * "/some/folder/": 200
		 */
	},

	/*
	 * Localization, for example "en", "de" etc. - see h5aiLangs below for
	 * possible values. Adjust it to your needs. If lang is not found in
	 * h5aiLangs the displayed labels stay unchanged.
	 */
	lang: undefined,

	/*
	 * Try to use browser language, falls back to previous specified lang. 
	 */
	useBrowserLang: true,
	
	/*
	 * Set parent folder labels to real folder names.
	 */
	setParentFolderLabels: true,
	
	/*
	 * Link the hover effects between crumb, extended view and tree.
	 */
	linkHoverStates: true
};



/*
 * Available translations.
 * "en" is just an example - see it as a reference. Those values
 * are "hardcoded" and will be displayed if all labels stay unchanged. 
 */
h5aiLangs = {

	"en": {
		viewDetails: "details",
		viewIcons: "icons",
		columnName: "Name",
		columnLastModified: "Last modified",
		columnSize: "Size",
		footerUsing: "using",
		parentDirectory: "Parent Directory",
		empty: "empty"
	},

	"de": {
		viewDetails: "Details",
		viewIcons: "Icons",
		columnName: "Name",
		columnLastModified: "Geändert",
		columnSize: "Größe",
		footerUsing: "nutzt",
		parentDirectory: "Übergeordnetes Verzeichnis",
		empty: "leer"
	},
	
	"fr": {
		viewDetails: "détails",
		viewIcons: "icônes",
		columnName: "Nom",
		columnLastModified: "Dernière modification",
		columnSize: "Taille",
		footerUsing: "utilise",
		parentDirectory: "Dossier parent",
		empty: "vide"
	},

	"nl": {
		viewDetails: "details",
		viewIcons: "iconen",
		columnName: "Naam",
		columnLastModified: "Laatste wijziging",
		columnSize: "Grootte",
		footerUsing: "gebruikt",
		parentDirectory: "Bovenliggende map",
		empty: "lege"
	},

	"sv": {
		viewDetails: "detaljerad",
		viewIcons: "ikoner",
		columnName: "Filnamn",
		columnLastModified: "Senast ändrad",
		columnSize: "Filstorlek",
		footerUsing: "använder",
		parentDirectory: "Till överordnad mapp",
		empty: "tom"
	},

	"cs": {
		viewDetails: "podrobnosti",
		viewIcons: "ikony",
		columnName: "Název",
		columnLastModified: "Upraveno",
		columnSize: "Velikost",
		footerUsing: "používá",
		parentDirectory: "Nadřazený adresář",
		empty: "prázdný"
	},

	"sk": {
		viewDetails: "podrobnosti",
		viewIcons: "ikony",
		columnName: "Názov",
		columnLastModified: "Upravené",
		columnSize: "Velkosť",
		footerUsing: "používá",
		parentDirectory: "Nadriadený priečinok",
		empty: "prázdny"
	},

	"es": {
		viewDetails: "Detalles",
		viewIcons: "Íconos",
		columnName: "Nombre",
		columnLastModified: "Última modificación",
		columnSize: "Tamaño",
		footerUsing: "usando",
		parentDirectory: "Directorio superior",
		empty: "vacío"
	},

	"tr": {
		viewDetails: "detaylar",
		viewIcons: "ikonlar",
		columnName: "İsim",
		columnLastModified: "Son Düzenleme",
		columnSize: "Boyut",
		footerUsing: "kullanıyor",
		parentDirectory: "Üst Dizin",
		empty: "boş"
	}

};
