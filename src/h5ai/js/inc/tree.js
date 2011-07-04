
var Tree = function ( utils, h5ai ) {

	var thistree = this;
	var contentTypeRegEx = /^text\/html;h5ai=/;

	this.init = function () {

		if ( h5ai.config.showTree ) {
			this.checkCrumb();
			this.initShifting();
			this.populateTree();
		};
	};


	this.checkCrumb = function () {

		$( "li.crumb a" ).each( function() {
			
			var $a = $( this );
			var pathname = $a.attr( "href" );
			thistree.checkPathname( pathname, function ( status ) {
				if ( status !== 0 ) {
					$( "<img class='hint' src='/h5ai/images/page.png' alt='not listable' />" ).appendTo( $a );
					if ( status !== 200 ) {
						$( "<span class='hint'>(" + status + ")</span>" ).appendTo( $a );
					};
				};
			} );
		} );
	};


	this.shiftTree = function ( show ) {
		
		var $tree = $( "#tree" );
		var $extended = $( "#extended" );
		var show = show || false;

		if ( $tree.outerWidth() < $extended.offset().left || show ) {
			$tree.stop().animate( { left: 0 } );										
		} else {
			$tree.stop().animate( { left: 24 - $tree.outerWidth() } );					
		};
	};
	

	this.initShifting = function () {
		
		$( "#tree" ).hover(
			function () {
				thistree.shiftTree( true );
			},
			function () {
				thistree.shiftTree();
			}
		);
		$( window ).resize( function() {
			thistree.shiftTree();	
		} );
	};

	
	this.populateTree = function () {

		var $tree = $( "#tree" );
		$tree.css( { left: -400 } ).show();

		this.shiftTree();
		
		this.fetchTree( decodeURI( document.location.pathname ), function( entry ) {
			$tree.empty().append( entry.toHtml() );
			thistree.shiftTree();
		} );
	};

	
	this.fetchTree = function ( pathname, callback ) {
		
		this.walkBack( pathname, function( walkbackedPathname ) {
			var entry = new File( utils, walkbackedPathname );
			thistree.fetchEntriesRecursive( walkbackedPathname, function ( content ) {
				entry.content = content;
				callback( entry );
			} );
		} );
	};


	this.walkBack = function ( pathname, callback ) {

		var splits = utils.splitPathname( pathname );
		var parent = splits[0];
		if ( parent === "" ) {
			callback( pathname );
		} else {
			this.checkPathname( parent, function( state ) {
				if ( state === 0 ) {
					thistree.walkBack( parent, callback );
				} else {
					callback( pathname );
				};
			} );
		};
	};


	this.fetchEntriesRecursive = function ( pathname, callback ) {

		this.fetchEntries( pathname, false, function ( entries ) {
			if ( entries instanceof Array ) {
				for ( idx in entries ) {
					( function ( entry ) {
						if ( entry.isFolder ) {
							thistree.fetchEntriesRecursive( entry.absHref, function( content ) {
								entry.content = content;
								callback( entries );
							} );
						};
					} ) ( entries[idx] );
				};
			};
			callback( entries );
		} );
	};


	this.fetchEntries = function ( pathname, includeParent, callback ) {

		this.checkPathname( pathname, function ( status ) {
			console.log( "checkPathname", pathname, status );
			if ( status !== 0 ) {
				callback( status );
			} else {
				$.ajax( {
					url: pathname,
					type: "GET",
					dataType: "html",
					error: function ( xhr ) {
						// since it was checked before this should never happen
						callback( xhr.status );
					},
					success: function ( html, status, xhr ) {
						if ( !contentTypeRegEx.test( xhr.getResponseHeader( "Content-Type" ) ) ) {
							// since it was checked before this should never happen
							callback( xhr.status );
						} else {
							var entries = [];
							$( html ).find( "#table table td" ).closest( "tr" ).each( function () { 
								var entry = new File( utils, pathname, this );
								if ( !entry.isParentFolder || includeParent ) {
									entries.push( entry );
								};
							} );
							callback( entries );
						};
					}
				} );
			};
		} );
	};


	this.checkPathname = function ( pathname, callback ) {

		if ( h5ai.config.folderStatus[ pathname ] !== undefined ) {
			callback( h5ai.config.folderStatus[ pathname ] );
		} else {
			$.ajax( {
				url: pathname,
				type: "HEAD",
				complete: function ( xhr ) {
					if ( xhr.status === 200 && contentTypeRegEx.test( xhr.getResponseHeader( "Content-Type" ) ) ) {
						callback( 0 );
					} else {
						callback( xhr.status );
					};
				}
			} );
		};
	};
};
