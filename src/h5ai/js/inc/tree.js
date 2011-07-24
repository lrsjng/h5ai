
var Tree = function ( pathCache, h5ai ) {

	var THIS = this;
	var contentTypeRegEx = /^text\/html;h5ai=/;

	this.init = function () {

		if ( h5ai.config.showTree ) {
			this.updatePaths();
			this.populateTree();
		};
	};


	this.updatePath = function ( path ) {

		if ( path.isFolder && !path.isParentFolder && path.status === undefined ) {
			this.fetchStatus( path.absHref, function ( status ) {
				if ( status !== "h5ai" ) {
					path.status = status;
				};
				path.updateHtml();
			} );
		};
	};


	this.updatePaths = function () {

		for ( var ref in pathCache.cache ) {
			this.updatePath( pathCache.cache[ref] );
		};
	};


	this.populateTree = function () {

		var $tree = $( "#tree" );
		var $extended = $( "#extended" );
		var shiftTree = function ( forceVisible, dontAnimate ) {
			if ( $tree.outerWidth() < $extended.offset().left || forceVisible === true ) {
				if ( dontAnimate === true ) {
					$tree.stop().css( { left: 0 } );															
				} else {
					$tree.stop().animate( { left: 0 } );										
				};
			} else {
				if ( dontAnimate === true ) {
					$tree.stop().css( { left: 18 - $tree.outerWidth() } );					
				} else {
					$tree.stop().animate( { left: 18 - $tree.outerWidth() } );					
				};
			};
		};

		$tree.hover( function () { shiftTree( true ); }, function () { shiftTree(); } );
		$( window ).resize( function() {
			shiftTree();
		} );

		this.fetchTree( document.location.pathname, function( path ) {
			$tree.append( path.updateTreeHtml() );
			$tree.show();
			scrollpanel( $tree );
			shiftTree( false, true );
		} );
	};


	this.fetchTree = function ( pathname, callback, childPath ) {

		this.fetchPath( pathname, $.proxy( function ( path ) {
			
			path.treeOpen = true;
			
			if ( childPath !== undefined ) {
				path.content[ childPath.absHref ] = childPath;
			};

			var parent = pathCache.splitPathname( pathname )[0];
			if ( parent === "" ) {
				callback( path );
			} else {
				this.fetchTree( parent, callback, path );				
			};
		}, this ) );
	};


	this.fetchPath = function ( pathname, callback ) {

		this.fetchStatusAndContent( pathname, false, function ( status, content ) {
			var path = pathCache.getPathForFolder( pathname );
			path.status = status;
			path.content = content;
			callback( path );
		} );
	};


	this.fetchStatusAndContent = function ( pathname, includeParent, callback ) {

		this.fetchStatus( pathname, function ( status ) {

			if ( status !== "h5ai" ) {
				callback( status, {} );
				return;
			};

			$.ajax( {
				url: pathname,
				type: "GET",
				dataType: "html",
				error: function ( xhr ) {
					callback( xhr.status, {} ); // since it was checked before this should never happen
				},
				success: function ( html, status, xhr ) {
					if ( !contentTypeRegEx.test( xhr.getResponseHeader( "Content-Type" ) ) ) {
						callback( xhr.status, {} ); // since it was checked before this should never happen
						return;
					};

					var content =  {};
					$( html ).find( "#table td" ).closest( "tr" ).each( function () { 
						var path = pathCache.getPathForTableRow( pathname, this );
						if ( path.isFolder && ( !path.isParentFolder || includeParent ) ) {
							content[path.absHref] = path;
							THIS.updatePath( path );
						};
					} );
					callback( "h5ai", content );
				}
			} );
		} );
	};


	var pathnameStatusCache = {};

	this.fetchStatus = function ( pathname, callback ) {

		if ( h5ai.config.folderStatus[ pathname ] !== undefined ) {
			callback( h5ai.config.folderStatus[ pathname ] );
			return;
		} else if ( pathnameStatusCache[ pathname ] !== undefined ) {
			callback( pathnameStatusCache[ pathname ] );
			return;
		};

		$.ajax( {
			url: pathname,
			type: "HEAD",
			complete: function ( xhr ) {
				var status = xhr.status;
				if ( status === 200 && contentTypeRegEx.test( xhr.getResponseHeader( "Content-Type" ) ) ) {
					status = "h5ai";
				};
				pathnameStatusCache[ pathname ] = status;
				callback( status );
			}
		} );
	};


	var scrollpanel = function ( htmlElement ) {

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

		var update = function () {
			$wrapper.css( "height", $element.height() );
			var visibleHeight = $element.height();
			var contentHeight = $content.outerHeight();
			var scrollTop = $wrapper.scrollTop();
			var scrollTopFrac = scrollTop / contentHeight;
			var visVertFrac = Math.min( visibleHeight / contentHeight, 1 );
			
			if ( visVertFrac < 1 ) {
				$wrapper.css( "padding-right", $scrollbar.outerWidth( true ) );
				$scrollbar
					.show()
					.css( {
						height: $element.innerHeight() + $scrollbar.height() - $scrollbar.outerHeight( true )
					} );
				$drag
					.css( {
						top: $scrollbar.height() * scrollTopFrac,
						height: $scrollbar.height() * visVertFrac
					} );
			} else {
				$wrapper.css( "padding-right", 0 );
				$scrollbar.hide()				
			};
		};
		var scroll = function ( event ) {
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
				height: $element.height(),
				overflow: "hidden"
			} );
		$scrollbar
			.css( {
				position: "absolute",
				top: 0,
				right: 0,
				overflow: "hidden"
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
				event.stopPropagation();
			} )
			.attr( "unselectable", "on" )
			.css( "-moz-user-select", "none" )
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

};
