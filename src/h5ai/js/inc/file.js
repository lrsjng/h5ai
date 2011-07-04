
var File = function ( utils, folder, tableRow ) {

	if ( ! /\/$/.test( folder ) ) {
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
