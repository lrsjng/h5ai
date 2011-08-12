( function ( $ ) {

	var init = function ( htmlElement ) {

		var $element = $( htmlElement );
		
		if ( $element.css( "position" ) === undefined || $element.css( "position" ) === "static" ) {
			$element.css( "position", "relative" );
		};

		var $scrollbar = $( "<div class='scrollbar' />" );
		var $drag = $( "<div class='drag' />" ).appendTo( $scrollbar );
		$element
			.wrapInner( "<div class='wrapper'><div class='content' /></div>" )
			.append( $scrollbar );
		var $wrapper = $element.find( "> .wrapper" );
		var $content = $wrapper.find( "> .content" );
		var mouseOffsetY = 0;
		var updateId = undefined;

		var update = function ( repeat ) {
			if ( updateId !== undefined && !repeat ) {
				clearInterval( updateId );
				updateId = undefined;
			} else if ( updateId === undefined && repeat ) {
				updateId = setInterval( function() { update( true ); }, 50 );
			};

			$wrapper.css( "height", $element.height() );
			var visibleHeight = $element.height();
			var contentHeight = $content.outerHeight();
			var scrollTop = $wrapper.scrollTop();
			var scrollTopFrac = scrollTop / contentHeight;
			var visVertFrac = Math.min( visibleHeight / contentHeight, 1 );
			
			if ( visVertFrac < 1 ) {
				$scrollbar
					.fadeIn( 50 )
					.css( {
						height: $element.innerHeight() + $scrollbar.height() - $scrollbar.outerHeight( true )
					} );
				$drag
					.css( {
						top: $scrollbar.height() * scrollTopFrac,
						height: $scrollbar.height() * visVertFrac
					} );
			} else {
				$scrollbar.fadeOut( 50 );
			};
		};
		var scroll = function ( event ) {
			event.preventDefault();
			var clickFrac = ( event.pageY - $scrollbar.offset().top - mouseOffsetY ) / $scrollbar.height();
			$wrapper.scrollTop( $content.outerHeight() * clickFrac );
			update();
		};

		$element
			.mousewheel( function ( event, delta) {
				$wrapper.scrollTop( $wrapper.scrollTop() - 50 * delta );
				update();
				event.stopPropagation();
				event.preventDefault();
			} )
			.scroll( update );
		$element.get( 0 ).updateScrollbar = update;
		$wrapper
			.css( {
				"padding-right": $scrollbar.outerWidth( true ),
				height: $element.height(),
				overflow: "hidden"
			} );
		$scrollbar
			.css( {
				position: "absolute",
				top: 0,
				right: 0,
				overflow: "hidden",
				cursor: "pointer"
			} )
			.mousedown( function ( event ) {
				mouseOffsetY = $drag.outerHeight() / 2;
				scroll( event );
				$scrollbar.addClass( "dragOn" );
				$( window )
					.bind( "mousemove", scroll )
					.one( "mouseup", function ( event ) {
						$scrollbar.removeClass( "dragOn" );
						$( window ).unbind( "mousemove", scroll );
						scroll( event );
						event.stopPropagation();
					} );
				event.preventDefault();
			} )
			.each( function () { 
				this.onselectstart = function () {
					return false;
				};
			} );
		$drag
			.css( {
				position: "absolute",
				left: 0,
				width: "100%"
			} )
			.mousedown( function ( event ) {
				mouseOffsetY = event.pageY - $drag.offset().top;
				scroll( event );
				$scrollbar.addClass( "dragOn" );
				$( window )
					.bind( "mousemove", scroll )
					.one( "mouseup", function ( event ) {
						$scrollbar.removeClass( "dragOn" );
						$( window ).unbind( "mousemove", scroll );
						scroll( event );
						event.stopPropagation();
					} );
				event.stopPropagation();
			} );

		update();
	};

	
	$.fn.scrollpanel = function () {
		
		return this.each( function () {

			init( this );
		} );
	};

} )( jQuery );