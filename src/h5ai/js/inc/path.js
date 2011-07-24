

var PathCache = function () {

	
	var pathnameRegEx = /^(\/(.*\/)*)([^\/]+\/?)$/;

	this.splitPathname = function ( pathname ) {
		
		if ( pathname === "/"  ) {
			return [ "", "/" ];
		};
		var match = pathnameRegEx.exec( pathname );
		return [ match[1], match[3] ];
	};


	this.cache = {};


	this.loadCache = function () {

		var json = localStorage.getItem( "h5ai.cache" );
		var objs = $.evalJSON( json );
		var cache = {};
		for ( idx in objs ) {
			var obj = objs[idx];
			var path = this.objectToPath( obj );
			cache[path.absHref] = path;
		};
		return cache;
	};


	this.storeCache = function () {

		var objs = [];
		for ( ref in this.cache ) {
			var path = this.cache[ref];
			if ( path.isFolder ) {
				objs.push( this.pathToObject( path ) );
			};
		};
		var json = $.toJSON( objs ); 
		localStorage.setItem( "h5ai.cache", json );
	};


	this.pathToObject = function ( path ) {

		var object = {
			r: path.absHref,
			s: path.status,
			c: [],
			o: path.treeOpen
		};

		if ( path.content !== undefined ) {
			for ( ref in path.content ) {
				object.c.push( ref );
			};
		};

		return object;
	};


	this.objectToPath = function ( obj ) {
		
		var path = this.getPathForFolder( obj.r );
		path.status = obj.s;
		path.content = {};
		path.treeOpen = obj.o;
		for ( idx in obj.c ) {
			var href = obj.c[idx];
			path.content[href] = this.getPathForFolder( href );
		};
		return path;
	};
	

	this.getPathForFolder = function ( folder ) {

		return this.getCachedPath( new Path( this, folder ) );
	};


	this.getPathForTableRow = function ( parentFolder, tableRow ) {

		return this.getCachedPath( new Path( this, parentFolder, tableRow ) );
	};


	this.getCachedPath = function ( path ) {

		if ( path.isParentFolder ) {
			return path;
		};

		var cachedPath = this.cache[path.absHref];
		if ( cachedPath !== undefined ) {
			return cachedPath;
		};

		this.cache[path.absHref] = path;
		this.storeCache();
		return path;
	};

	this.cache = this.loadCache();

};



var Path = function ( pathCache, folder, tableRow ) {

	if ( ! /\/$/.test( folder ) ) {
		folder += "/";
	};

	if ( tableRow !== undefined ) {
		var $tds = $( tableRow ).find( "td" );
		var $img = $tds.eq( 0 ).find( "img" );
		var $a= $tds.eq( 1 ).find( "a" );

		this.parentFolder = folder;
		this.icon16 = $img.attr( "src" );
		this.alt = $img.attr( "alt" );
		this.label = $a.text();
		this.href = $a.attr("href"); //decodeURI( $a.attr("href") );
		this.date = $tds.eq( 2 ).text();
		this.size = $tds.eq( 3 ).text();
	} else {
		var splits = pathCache.splitPathname( folder );

		this.parentFolder = splits[0];
		this.href = splits[1];
		this.label = decodeURI( splits[1] );
		this.icon16 = "/h5ai/icons/16x16/folder.png";
		this.alt = "[DIR]";
		this.date = "";
		this.size = "";			
		if ( this.label === "/" ) {
			this.label = decodeURI( document.domain ) + "/";
		};
	};

	if ( /\/$/.test( this.label ) ) {
		this.label = this.label.slice( 0, -1 );
	};

	this.icon48 = this.icon16.replace( "16x16", "48x48" );
	this.isFolder = ( this.alt === "[DIR]" );
	this.isParentFolder = ( this.isFolder && this.label === "Parent Directory" );
	this.absHref = this.isParentFolder ? this.href : this.parentFolder + this.href;
	this.isCurrentFolder = ( this.absHref === document.location.pathname );
	this.isDomain = ( this.absHref === "/" );

	if ( this.isParentFolder && h5ai.config.setParentFolderLabels ) {
		if ( this.isDomain ) {
			this.label = decodeURI( document.domain );
		} else {
			this.label = decodeURI( pathCache.splitPathname( pathCache.splitPathname( this.parentFolder )[0] )[1].slice( 0, -1 ) );
		};
	};

	this.status = undefined;  // undefined, "h5ai" or HTTP response code
	this.content = undefined;  // associative array path.absHref -> path
	this.html = {
		$crumb: undefined,
		$extended: undefined,
		$tree: undefined
	};
	this.treeOpen = false;

	this.isEmpty = function() {

		return this.content === undefined || $.isEmptyObject( this.content );
	};


	this.onClick = function ( context ) {

		pathCache.storeCache();
		h5ai.triggerPathClick( this, context );
	};


	this.onHoverIn = function () {

		if ( h5ai.config.linkHoverStates ) {
			for ( ref in this.html ) {
				$ref = this.html[ref];
				if ( $ref !== undefined ) {
					$ref.find( "> a" ).addClass( "hover" );
				};
			};
		};
	};


	this.onHoverOut = function () {
		
		if ( h5ai.config.linkHoverStates ) {
			for ( ref in this.html ) {
				$ref = this.html[ref];
				if ( $ref !== undefined ) {
					$ref.find( "> a" ).removeClass( "hover" );
				};
			};
		};
	};


	this.updateHtml = function () {

		this.updateCrumbHtml();
		this.updateExtendedHtml();
		this.updateTreeHtml();
	};


	this.updateCrumbHtml = function () {

		var $html = $( "<li class='crumb' />" ).data( "path", this );

		try {
			$html.addClass( this.isFolder ? "folder" : "file" );
			var $a = $( "<a href='" + this.absHref + "'><img src='/h5ai/images/crumb.png' alt='>' />" + this.label + "</a>" );
			$a.click( $.proxy( function() { this.onClick( "crumb" ); }, this ) );
			$a.hover( $.proxy( function() { this.onHoverIn( "crumb" ); }, this ), $.proxy( function() { this.onHoverOut( "crumb" ); }, this ) );
			$html.append( $a );
			
			if ( this.isDomain ) {
				$html.addClass( "domain" );
				$a.find( "img" ).attr( "src", "/h5ai/images/home.png" );
			};
			
			if ( this.isCurrentFolder ) {
				$html.addClass( "current" );
			};
			
			if ( !isNaN( this.status ) ) {
				if ( this.status === 200 ) {
					$( "<img class='hint' src='/h5ai/images/page.png' alt='not listable' />" ).appendTo( $a );
				} else {
					$( "<span class='hint'>(" + this.status + ")</span>" ).appendTo( $a );
				};
			};
		} catch( err ) {
			$( "<span class='fail'>failed</span>" ).appendTo( $html );
		};

		if ( this.html.$crumb !== undefined ) {
			this.html.$crumb.replaceWith( $html );
		};
		this.html.$crumb = $html;

		return $html;
	};


	this.updateExtendedHtml = function () {

		var $html = $( "<li class='entry' />" ).data( "path", this );

		try {
			$html.addClass( this.isFolder ? "folder" : "file" );
			var $a = $( "<a href='" + this.absHref + "' />" ).appendTo( $html );
			$a.click( $.proxy( function() { this.onClick( "extended" ); }, this ) );
			$a.hover( $.proxy( function() { this.onHoverIn( "extended" ); }, this ), $.proxy( function() { this.onHoverOut( "extended" ); }, this ) );

			$( "<span class='icon small'><img src='" + this.icon16 + "' alt='" + this.alt + "' /></span>" ).appendTo( $a );
			$( "<span class='icon big'><img src='" + this.icon48 + "' alt='" + this.alt + "' /></span>" ).appendTo( $a );
			var $label = $( "<span class='label'>" + this.label + "</span>" ).appendTo( $a );
			$( "<span class='date'>" + this.date + "</span>" ).appendTo( $a );
			$( "<span class='size'>" + this.size + "</span>" ).appendTo( $a );

			if ( this.isParentFolder ) {
				if ( !h5ai.config.setParentFolderLabels ) {
					$label.addClass( "l10n-parentDirectory" );
				};
				$html.addClass( "parentfolder" );
			};

			if ( !isNaN( this.status ) ) {
				if ( this.status === 200 ) {
					$html.addClass( "page" );
					$a.find( ".icon.small img" ).attr( "src", "/h5ai/icons/16x16/folder-page.png" );
					$a.find( ".icon.big img" ).attr( "src", "/h5ai/icons/48x48/folder-page.png" );
				} else {
					$html.addClass( "error" );
					$label.append(  $( "<span class='hint'> " + this.status + " </span>" ) );
				};
			};
		} catch( err ) {
			$( "<span class='fail'>failed</span>" ).appendTo( $html );
		};

		if ( this.html.$extended !== undefined ) {
			this.html.$extended.replaceWith( $html );
		};
		this.html.$extended = $html;

		return $html;
	};


	this.updateTreeHtml = function () {

		var $html = $( "<div class='entry' />" ).data( "path", this );
		var $blank = $( "<span class='blank' />" ).appendTo( $html );

		try {
			$html.addClass( this.isFolder ? "folder" : "file" );
			var $a = $( "<a href='" + this.absHref + "' />" )
				.appendTo( $html )
				.append( $( "<span class='icon'><img src='" + this.icon16 + "' /></span>" ) )
				.append( $( "<span class='label'>" + this.label + "</span>" ) );
			$a.click( $.proxy( function() { this.onClick( "tree" ); }, this ) );
			$a.hover( $.proxy( function() { this.onHoverIn( "tree" ); }, this ), $.proxy( function() { this.onHoverOut( "tree" ); }, this ) );

			if ( this.isFolder ) {
				// indicator
				if ( this.status === undefined || !this.isEmpty() ) {
					var $indicator = $( "<span class='indicator'><img src='/h5ai/images/tree.png' /></span>" );
					if ( this.status === undefined ) {
						$indicator.addClass( "unknown" );
					} else if ( this.treeOpen ) {
						$indicator.addClass( "open" );
					};
					$indicator.click( $.proxy( function( event ) {
						if ( $indicator.hasClass( "unknown" ) ) { 
							tree.fetchStatusAndContent( this.absHref, false, $.proxy( function ( status, content ) {
								this.status = status;
								this.content = content;
								this.treeOpen = true;
								this.updateTreeHtml( function() {
									$( "#tree" ).get( 0 ).updateScrollbar();
								} );
							}, this ) );
						} else if ( $indicator.hasClass( "open" ) ) {
							this.treeOpen = false;
							$indicator.removeClass( "open" );
							$html.find( "> ul.content" ).slideUp( function() {
								$( "#tree" ).get( 0 ).updateScrollbar();
							} );
						} else {
							this.treeOpen = true;
							$indicator.addClass( "open" );
							$html.find( "> ul.content" ).slideDown( function() {
								$( "#tree" ).get( 0 ).updateScrollbar();
							} );				
						};
					}, this ) );
					$blank.replaceWith( $indicator );
				};

				// is this the domain?
				if ( this.isDomain ) {
					$html.addClass( "domain" );
					$a.find( ".icon img" ).attr( "src", "/h5ai/icons/16x16/folder-home.png" );
				};

				// is this the current folder?
				if ( this.isCurrentFolder ) {
					$html.addClass( "current" );
					$a.find( ".icon img" ).attr( "src", "/h5ai/icons/16x16/folder-open.png" );
				};

				// does it have subfolders?
				if ( !this.isEmpty() ) {
					var $ul = $( "<ul class='content' />" ).appendTo( $html );
					for ( idx in this.content ) {
						$( "<li />" ).append( this.content[idx].updateTreeHtml() ).appendTo( $ul );
					};
					if ( this.status === undefined || !this.treeOpen ) {
						$ul.hide();
					};
				};

				// reflect folder status
				if ( !isNaN( this.status ) ) {
					if ( this.status === 200 ) {
						$a.find( ".icon img" ).attr( "src", "/h5ai/icons/16x16/folder-page.png" );
						$a.append( $( "<span class='hint'><img src='/h5ai/images/page.png' /></span>" ) );
					} else {
						$html.addClass( "error" );
						$a.append( $( "<span class='hint'>" + this.status + "</span>" ) );
					};
				};
			};
		} catch( err ) {
			$( "<span class='fail'>failed</span>" ).appendTo( $html );
		};

		if ( this.html.$tree !== undefined ) {
			this.html.$tree.replaceWith( $html );
		};
		this.html.$tree = $html;

		return $html;
	};
};
