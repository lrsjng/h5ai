
( function( $ ) {



	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {
	
		window.setTimeout( function() {
//			$.h5aiTree = new H5aiTree();
		}, 1 );
	} );


	H5aiTree = function ( options ) {

		
		var h5aiMetaRegEx = /<meta name="h5ai-version"/;
		var folderRegEx = /\/$/;
		var pathnameRegEx = /^(\/(.*\/)*)([^\/]+\/?)$/;


		function init() {

			checkCrumb();
			initShifting();
			populateTree();
		};


		function splitPathname( pathname ) {
			
			if ( pathname === "/"  ) {
				return [ "", "/" ];
			};
			var match = pathnameRegEx.exec( pathname );
			return [ match[1], match[3] ];
		};


		function checkCrumb() {

			$( "li.crumb a" ).each( function() {
				
				var $a = $( this );
				var pathname = $a.attr( "href" );
				checkPathname( pathname, function ( status ) {
					if ( status !== 0 ) {
						$( "<img class='hint' src='/h5ai/images/page.png' alt='not listable' />" ).appendTo( $a );
						if ( status !== 200 ) {
							$( "<span class='hint'>(" + status + ")</span>" ).appendTo( $a );
						};
					};
				} );
			} );
		};


		function shiftTree( show ) {
			
			var $tree = $( "#tree" );
			var $extended = $( "#extended" );
			var show = show || false;

			if ( $tree.outerWidth() < $extended.offset().left || show ) {
				$tree.stop().animate( { left: 0 } );										
			} else {
				//var left = Math.max( 24 - $tree.outerWidth(), $extended.offset().left - $tree.outerWidth() - 16 );
				var left = 24 - $tree.outerWidth();
				$tree.stop().animate( { left: left } );					
			};
		};
		

		function initShifting() {
			
			$( "#tree" ).hover(
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
		};

		
		function populateTree() {

			var $tree = $( "#tree" );
			$tree.css( { left: -400 } ).show();
			shiftTree();
			var pathname = decodeURI( document.location.pathname );
			fetchTree( pathname, function( entry ) {
				$tree.empty().append( entry.toHtml() );
				shiftTree();
			} );
		};

		
		function fetchTree( pathname, callback ) {
			
			walkBack( pathname, function( walkbackedPathname ) {
				var entry = new Entry( walkbackedPathname );
				fetchEntriesRecursive( walkbackedPathname, function ( content ) {
					entry.content = content;
					callback( entry );
				} );
			} );
		};


		function walkBack( pathname, callback ) {

			var splits = splitPathname( pathname );
			var parent = splits[0];
			if ( parent === "" ) {
				callback( pathname );
			} else {
				checkPathname( parent, function( state ) {
					if ( state === 0 ) {
						walkBack( parent, callback );
					} else {
						callback( pathname );
					};
				} );
			};
		};


		function fetchEntriesRecursive( pathname, callback ) {

			fetchEntries( pathname, false, function ( entries ) {
				if ( entries instanceof Array ) {
					for ( idx in entries ) {
						( function ( entry ) {
							if ( entry.isFolder ) {
								fetchEntriesRecursive( entry.absHref, function( content ) {
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


		function fetchEntries( pathname, includeParent, callback ) {

			$.ajax( {
				url: pathname,
				type: "GET",
				dataType: "html",
				error: function ( xhr ) {

					callback( xhr.status );
				},
				success: function ( html ) {

					if ( ! h5aiMetaRegEx.test( html ) ) {
						callback( 200 );
					} else {
						var entries = [];
						$( html ).find( "#table table td" ).closest( "tr" ).each( function () { 
							var entry = new Entry( pathname, this );
							if ( !entry.isParentFolder || includeParent ) {
								entries.push( entry );
							};
						} );
						callback( entries );
					};
				}
			} );
		};


		/*
		 * Checks pathname for accessibility.
		 * Calls callback with argument 0 if pathname is a h5ai styled directory.
		 * Otherwise it returns the http response status. 
		 */
		function checkPathname( pathname, callback ) {

			$.ajax( {
				url: pathname,
				type: "GET",
				dataType: "html",
				error: function ( xhr ) {

					callback( xhr.status );
				},
				success: function ( html ) {

					if ( h5aiMetaRegEx.test( html ) ) {
						callback( 0 );
					} else {
						callback( 200 );
					};
				}
			} );
		};


		Entry = function ( folder, tableRow ) {

			if ( !folderRegEx.test( folder ) ) {
				folder += "/";
			};

			if ( tableRow !== undefined ) {
				var $tds = $( tableRow ).find( "td" );
				var $img = $( $tds.get( 0 ) ).find( "img" );
				var $a= $( $tds.get( 1 ) ).find( "a" );
				
				this.parentFolder = folder;
				this.icon16 = $img.attr( "src" );
				this.alt = $img.attr( "alt" );
				this.label = $a.text();
				this.href = $a.attr("href");
				this.date = $( $tds.get(2) ).text();
				this.size = $( $tds.get(3) ).text();
			} else {
				var splits = splitPathname( folder );

				this.parentFolder = splits[0];
				this.label = splits[1];
				this.icon16 = "/h5ai/icons/16x16/folder.png";
				this.alt = "[DIR]";
				this.href = this.label;
				this.date = "";
				this.size = "";			
				if ( this.label === "/" ) {
					this.label = document.domain + "/";
				};
			};

			this.icon48 = this.icon16.replace( "16x16", "48x48" );
			this.isFolder = ( this.alt === "[DIR]" );
			this.isParentFolder = ( this.isFolder && this.label === "Parent Directory" );
			this.absHref = this.isParentFolder ? this.href : this.parentFolder + this.href;			
			this.content = undefined;


			this.isComplete = function () {
				
				if ( this.isFolder ) {
					if ( this.content === undefined ) {
						return false;
					} else if ( this.content instanceof Array  ) {
						for ( idx in this.content ) {
							if ( !this.content[idx].isComplete() ) {
								return false;
							};
						};
					};
				};
				return true;
			};


			this.toHtml = function () {
				
				var $entry = $( "<div class='entry' />" );

				try {
					var $a = $( "<a href='" + this.absHref + "' />" )
						.appendTo( $entry )
						.append( $( "<span class='icon'><img src='" + this.icon16 + "' /></span>" ) )
						.append( $( "<span class='label'>" + this.label + "</span>" ) );

					if ( this.isFolder ) {
						$entry.addClass( "folder" );
						if ( this.absHref === document.location.pathname ) {
							$a.find( ".icon img" ).attr( "src", "/h5ai/images/folder-open.png" );
							$entry.addClass( "current" );
						};
						if ( this.content instanceof Array ) {
							var $ul = $( "<ul class='content' />" ).appendTo( $entry );
							for ( idx in this.content ) {
								$( "<li />" ).append( this.content[idx].toHtml() ).appendTo( $ul );
							};
						} else if ( this.content === undefined ) {
							$a.append( $( "<span class='hint'><img src='/h5ai/images/loading.png' /></span>" ) );
						} else if ( this.content === 200 ) {
							$a.find( ".icon img" ).attr( "src", "/h5ai/images/folder-page.png" );
							$a.append( $( "<span class='hint'><img src='/h5ai/images/page.png' /></span>" ) );
						} else {
							$a.append( $( "<span class='hint error'>" + this.content + "</span>" ) );
							$entry.addClass( "notListable" );
						};
					} else {
						$entry.addClass( "file" );
					};

				} catch( err ) {
					$( "<span class='fail'>fail</span>" ).appendTo( $entry );
				};

				return $entry;
			};
		};


		init()
	};

} )( jQuery );