( function( $ ) {

	// @include "inc/jquery.json.min.js"
	// @include "inc/jquery.mousewheel.min.js"
	// @include "inc/jquery.scrollpanel.js"
	// @include "inc/jquery.utils.js"
	// @include "inc/path.js"
	// @include "inc/extended.js"
	// @include "inc/h5ai.js"
	// @include "inc/tree.js"


	/*******************************
	 * create
	 *******************************/

	var pathCache = new PathCache();
	var h5ai = new H5ai( h5aiOptions, h5aiLangs );
	var extended = new Extended( pathCache, h5ai );
	var tree = new Tree( pathCache, h5ai );


	/*******************************
	 * register public api
	 *******************************/

	$.h5ai = {
		click: $.proxy( h5ai.pathClick, h5ai )
	};

	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {

		extended.init();
		tree.init();	
		h5ai.init();
	} );
	
} )( jQuery );