
var File = function ( utils, folder, tableRow ) {

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

	this.icon48 = this.icon16.replace( "16x16", "48x48" );
	this.isFolder = ( this.alt === "[DIR]" );
	this.isParentFolder = ( this.isFolder && this.label === "Parent Directory" );
	this.absHref = this.isParentFolder ? this.href : this.parentFolder + this.href;
	this.status = undefined;  // undefined, "h5ai" or HTTP response code
	this.content = undefined;
	this.$treeHtml = undefined;


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


	this.updateTreeHtml = function () {

		var $html = $( "<div class='entry' />" ).data( "file", this );
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
							tree.fetchEntry( THIS.absHref, function ( newEntry ) {
								$html.replaceWith( newEntry.updateTreeHtml() );
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
				if ( this.absHref === decodeURI( document.location.pathname ) ) {
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

		if ( this.$treeHtml !== undefined ) {
			this.$treeHtml.replaceWith( $html );
		};
		this.$treeHtml = $html;

		return $html;
	};
};
