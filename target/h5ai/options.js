
h5aiOptions = {

	/*
	 * An array of view modes the user may chose from. Currently there
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
	 */
	showTree: false,

	/*
	 * Associative array of folders and their HTTP status codes to
	 * avoid HEAD requests to that folders.  
	 */
	folderStatus: {
		/*
		 * for example:
		 * "/some/folder/": 200
		 */
	}

};
