( function( $ ) {

	// @include "inc/utils.js"
	// @include "inc/h5ai.js"
	// @include "inc/file.js"
	// @include "inc/tree.js"


	/*******************************
	 * create
	 *******************************/

	var utils = new Utils();
	var h5ai = new H5ai( h5aiOptions );
	var tree = new Tree( utils, h5ai );


	/*******************************
	 * register public api
	 *******************************/

	$.h5ai = {
		folderClick: h5ai.folderClick,
		fileClick: h5ai.fileClick
	};


	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {
		h5ai.init();
		tree.init();
	} );

} )( jQuery );