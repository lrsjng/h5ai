( function( $ ) {

	// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	// modified
	$.log = function () {
		$.log.history = $.log.history || [];
		$.log.history.push( arguments );
		if ( window.console ) {
			window.console.log( Array.prototype.slice.call( arguments ) );
		};
	};

	var Timer = function () {
		this.start = new Date().getTime();;
		this.last = this.start;
		this.log = function ( label ) {
			var now = new Date().getTime();
			$.log( "timer", label, "+" + (now - this.last), "=" + (now - this.start) );
			this.last = now;
		};
	};
	$.timer = new Timer();
	
} )( jQuery );