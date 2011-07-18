( function( $ ) {

	// @include "inc/jquery.json.min.js"
	// @include "inc/path.js"
	// @include "inc/h5ai.js"
	// @include "inc/tree.js"


	/*******************************
	 * create
	 *******************************/

	var pathCache = new PathCache();
	var h5ai = new H5ai( h5aiOptions, h5aiLangs, pathCache );
	var tree = new Tree( pathCache, h5ai );


	/*******************************
	 * register public api
	 *******************************/

	$.h5ai = {
		click: $.proxy( h5ai.pathClick, h5ai )
	};

	$( ".l10n-footerUsing" ).click( function () {
		console.log( "clean" );
		pathCache.cache = {};
		console.log( "store" );
		pathCache.storeCache();
		console.log( "load", pathCache.loadCache() );
	} );

	
	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {
		h5ai.init();
		tree.init();
	} );

} )( jQuery );