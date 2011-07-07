
var Tree = function ( utils, h5ai ) {

	var THIS = this;
	var contentTypeRegEx = /^text\/html;h5ai=/;

	this.init = function () {

		if ( h5ai.config.showTree ) {
			this.checkCrumb();
			this.checkCurrentFolder();
			this.populateTree();
		};
	};


	this.checkCrumb = function () {

		$( "li.crumb a" ).each( function() {

			var $a = $( this );
			var pathname = $a.attr( "href" );
			THIS.checkPathname( pathname, function ( status ) {
				if ( !isNaN( status ) ) {
					if ( status === 200 ) {
						$( "<img class='hint' src='/h5ai/images/page.png' alt='not listable' />" ).appendTo( $a );
					} else {
						$( "<span class='hint'>(" + status + ")</span>" ).appendTo( $a );
					};
				};
			} );
		} );
	};


	this.checkCurrentFolder = function () {

		$( "#extended li.entry.folder" ).each( function() {

			var $entry = $( this );
			if ( $entry.hasClass( "parentfolder" ) ) {
				return;
			};

			var $a = $entry.find( "a" );
			var pathname = decodeURI( document.location.pathname ) + $a.attr( "href" );
			THIS.checkPathname( pathname, function ( status ) {
				if ( !isNaN( status ) ) {
					if ( status === 200 ) {
						$a.find( ".icon.small img" ).attr( "src", "/h5ai/icons/16x16/folder-page.png" );
						$a.find( ".icon.big img" ).attr( "src", "/h5ai/icons/48x48/folder-page.png" );
					} else {
						$entry.addClass( "error" );
						$a.find( ".label" )
							.append( " " )
							.append(  $( "<span class='hint'>" + status + "</span>" ) );
					};
				};
			} );
		} );
	};


	this.populateTree = function () {

		var $tree = $( "#tree" );
		var $extended = $( "#extended" );
		var shiftTree = function ( show ) {
			if ( $tree.outerWidth() < $extended.offset().left || show === true ) {
				$tree.stop().animate( { left: 0 } );										
			} else {
				$tree.stop().animate( { left: 18 - $tree.outerWidth() } );					
			};
		};

		$tree.hover(
				function () {
					shiftTree( true );
				},
				function () {
					shiftTree();
				}
		);

		$( window ).resize( function() {
			shiftTree();	
		} );

		this.fetchTree( decodeURI( document.location.pathname ), function( entry ) {
			$tree.append( entry.updateTreeHtml() );
			shiftTree();
		} );
	};


	this.fetchTree = function ( pathname, callback, child ) {

		this.fetchEntry( pathname, function ( entry ) {
			if ( child !== undefined ) {
				entry.content[ child.absHref ] = child;
			};

			var parent = utils.splitPathname( pathname )[0];
			if ( parent === "" ) {
				callback( entry );
			} else {
				THIS.fetchTree( parent, callback, entry );				
			};
		} );
	};


	this.fetchEntry = function ( pathname, callback ) {

		this.fetchEntries( pathname, false, function ( status, entries ) {
			var entry = new File( utils, pathname );
			entry.status = status;
			entry.content = entries;
			callback( entry );
		} );
	};


	this.fetchEntries = function ( pathname, includeParent, callback ) {

		this.checkPathname( pathname, function ( status ) {

			console.log( "checkPathname", pathname, status );

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

					var entries =  {};
					$( html ).find( "#table table td" ).closest( "tr" ).each( function () { 
						var entry = new File( utils, pathname, this );
						if ( entry.isFolder && ( !entry.isParentFolder || includeParent ) ) {
							entries[ entry.absHref ] = entry;
							THIS.checkPathname( entry.absHref, function ( status ) {
								if ( status !== "h5ai" ) {
									entry.status = status;
									entry.updateTreeHtml();
								};
							} );
						};
					} );
					callback( "h5ai", entries );
				}
			} );
		} );
	};

	
	var pathnameCache = {};

	this.checkPathname = function ( pathname, callback ) {

		if ( h5ai.config.folderStatus[ pathname ] !== undefined ) {
			callback( h5ai.config.folderStatus[ pathname ] );
			return;
		} else if ( pathnameCache[ pathname ] !== undefined ) {
			callback( pathnameCache[ pathname ] );
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
				pathnameCache[ pathname ] = status;
				callback( status );
			}
		} );
	};
};
