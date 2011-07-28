( function( $ ) {

	// @include "inc/jquery.json.min.js"
	// @include "inc/jquery.mousewheel.min.js"
	// @include "inc/path.js"
	// @include "inc/h5ai.js"
	// @include "inc/tree.js"

	
	var Timer = function () {

		this.start = new Date().getTime();;
		this.last = this.start;
		this.log = function ( label ) {
			var now = new Date().getTime();
			console.log( "timer", label, "+" + (now - this.last), "=" + (now - this.start) );
			this.last = now;
		};
	};
	$.timer = new Timer();


	/*******************************
	 * create
	 *******************************/

	$.timer.log( "start pathcache" );
	var pathCache = new PathCache();
	$.timer.log( "end   pathcache" );
	var h5ai = new H5ai( h5aiOptions, h5aiLangs, pathCache );
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
		h5ai.init();
		tree.init();	

		// just for testing, resets the local cache /////////
		$( ".l10n-footerUsing" ).click( function () {
			pathCache.cache = {};
			pathCache.objectCache = {};
			pathCache.storeCache();
		} );
		/////////////////////////////////////////////////////
	} );
	
} )( jQuery );