
var Tree = function ( pathCache, h5ai ) {


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
				h5ai.linkHoverStates();
			} );
		};
	};


	this.updatePaths = function () {

		for ( var ref in pathCache.cache ) {
			this.updatePath( pathCache.cache[ref] );
		};
	};


	this.populateTree = function () {

		this.fetchTree( document.location.pathname, function( path ) {
			$( "#tree" )
				.append( path.updateTreeHtml() )
				.scrollpanel()
				.show();
			h5ai.shiftTree( false, true );
			h5ai.linkHoverStates();
			pathCache.storeCache();
			setTimeout( function () {
				$( "#tree" ).get( 0 ).updateScrollbar();
			}, 1 );
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



	var THIS = this;
	var contentTypeRegEx = /^text\/html;h5ai=/;
	var pathnameStatusCache = {};

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
};
