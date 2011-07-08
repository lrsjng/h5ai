

var PathCache = function ( utils ) {

	this.cache = {};


	this.getPathForFolder = function ( folder ) {

		return this.getCachedPath( new Path( utils, folder ) );
	};


	this.getPathForTableRow = function ( parentFolder, tableRow ) {

		return this.getCachedPath( new Path( utils, parentFolder, tableRow ) );
	};


	this.getCachedPath = function ( path ) {

		if ( path.isParentFolder ) {
			return path;
		};

		var cachedPath = this.cache[path.absHref];
		if ( cachedPath !== undefined ) {
			console.log( "cached path:", cachedPath.absHref );
			return cachedPath;
		};

		console.log( "new path:", path.absHref );
		this.cache[path.absHref] = path;
		return path;
	};

};



var Path = function ( utils, folder, tableRow ) {

	var THIS = this;

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
		this.href = decodeURI( $a.attr("href") );
		this.date = $tds.eq( 2 ).text();
		this.size = $tds.eq( 3 ).text();
	} else {
		var splits = utils.splitPathname( folder );

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

	if ( /\/$/.test( this.label ) ) {
		this.label = this.label.slice( 0, -1 );
	};

	this.icon48 = this.icon16.replace( "16x16", "48x48" );
	this.isFolder = ( this.alt === "[DIR]" );
	this.isParentFolder = ( this.isFolder && this.label === "Parent Directory" );
	this.absHref = this.isParentFolder ? this.href : this.parentFolder + this.href;
	this.isCurrentFolder = ( decodeURI( document.location.pathname ) === this.absHref );

	if ( this.isParentFolder && h5ai.config.setParentFolderLabels ) {
		if ( this.absHref === "/" ) {
			this.label = decodeURI( document.domain );
		} else {
			this.label = utils.splitPathname( utils.splitPathname( this.parentFolder )[0] )[1].slice( 0, -1 );
		};
	};

	this.status = undefined;  // undefined, "h5ai" or HTTP response code
	this.content = undefined;  // associative array path.absHref -> path
	this.html = {
		$crumb: undefined,
		$extended: undefined,
		$tree: undefined
	};


	this.isEmpty = function() {

		if ( this.content === undefined ) {
			return true;
		};
		for ( var prop in this.content ) {
			if( this.content.hasOwnProperty( prop ) ) {
				return false;
			};
		};
		return true;
	};


	this.updateHtml = function () {

		this.updateCrumbHtml();
		this.updateExtendedHtml();
		this.updateTreeHtml();
	};


	this.updateCrumbHtml = function () {

		var $html = $( "<li class='crumb' />" ).data( "path", this );

		try {
			var $a = $( "<a href='" + this.absHref + "'><img src='/h5ai/images/crumb.png' alt='>' />" + this.label + "</a>" );
			$html.append( $a );
			
			if ( !isNaN( this.status ) ) {
				if ( this.status === 200 ) {
					$( "<img class='hint' src='/h5ai/images/page.png' alt='not listable' />" ).appendTo( $a );
				} else {
					$( "<span class='hint'>(" + this.status + ")</span>" ).appendTo( $a );
				};
			};
			
			if ( this.isCurrentFolder ) {
				$html.addClass( "current" );
			};
		} catch( err ) {
			console.log( "updateCrumbHtml failed",  err );
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
			if ( this.isFolder ) {
				$html.addClass( "folder" )
					.click( function() {
						h5ai.triggerFolderClick( THIS );
					} );
			} else {
				$html.addClass( "file" )
					.click( function() {
						h5ai.triggerFileClick( THIS );
					} );
			};
			var $a = $( "<a href='" + this.href + "' />" ).appendTo( $html );
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
					$label.append( " " ).append(  $( "<span class='hint'>" + this.status + "</span>" ) );
				};
			};
		} catch( err ) {
			console.log( "updateExtendedHtml failed",  err );
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
			var $a = $( "<a href='" + this.absHref + "' />" )
				.appendTo( $html )
				.append( $( "<span class='icon'><img src='" + this.icon16 + "' /></span>" ) )
				.append( $( "<span class='label'>" + this.label + "</span>" ) );

			if ( this.isFolder ) {

				$html.addClass( "folder" );

				// indicator
				if ( this.status === undefined || !this.isEmpty() ) {
					var $indicator = $( "<span class='indicator'><img src='/h5ai/images/tree.png' /></span>" );
					if ( this.status === undefined ) {
						$indicator.addClass( "unknown" );
					} else {
						$indicator.addClass( "open" );
					};
					$indicator.click( function( event ) {
						if ( $indicator.hasClass( "unknown" ) ) { 
							tree.fetchPath( THIS.absHref, function ( path ) {
								$html.replaceWith( path.updateTreeHtml() );
							} );
						} else if ( $indicator.hasClass( "open" ) ) {
							$indicator.removeClass( "open" );
							$html.find( "> ul.content" ).slideUp();
						} else {
							$indicator.addClass( "open" );
							$html.find( "> ul.content" ).slideDown();				
						};
					} );
					$blank.replaceWith( $indicator );
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

			} else {
				$html.addClass( "file" );
			};
		} catch( err ) {
			console.log( "updateTreeHtml failed",  err );
			$( "<span class='fail'>failed</span>" ).appendTo( $html );
		};

		if ( this.html.$tree !== undefined ) {
			this.html.$tree.replaceWith( $html );
		};
		this.html.$tree = $html;

		return $html;
	};
};
