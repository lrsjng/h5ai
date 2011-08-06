( function( $ ) {

	// @include "inc/jquery.json.min.js"
	// @include "inc/jquery.mousewheel.min.js"
	// @include "inc/jquery.scrollpanel.js"
	// @include "inc/jquery.utils.js"
	// @include "inc/h5ai.js"


	/*******************************
	 * create
	 *******************************/

	var h5ai = new H5ai( h5aiOptions, h5aiLangs );


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
		$( "#tree" ).scrollpanel();
	} );
	
} )( jQuery );