
var Extended = function ( pathCache, h5ai ) {


	/*******************************
	 * config
	 *******************************/

	this.config = {
		customHeader: "h5ai.header.html",
		customFooter: "h5ai.footer.html"
	};


	/*******************************
	 * init
	 *******************************/

	this.init = function () {

		try {
			document.title = decodeURI( document.domain + document.location.pathname );
		} catch ( err ) {
			document.title = document.domain + document.location.pathname;
		};

		this.initBreadcrumb();
		this.initExtendedView();
		this.customize();
		this.initCounts();
	};



	/*******************************
	 * breadcrumb
	 *******************************/

	this.initBreadcrumb = function () {

		var $ul = $( "body > nav ul" );

		var pathname = "/";
		var path = pathCache.getPathForFolder( pathname );
		$ul.append( path.updateCrumbHtml() );

		var pathnameParts = document.location.pathname.split( "/" );
		for ( idx in pathnameParts ) {
			var part = pathnameParts[idx];
			if ( part !== "" ) {
				pathname += part + "/";
				var path = pathCache.getPathForFolder( pathname );
				$ul.append( path.updateCrumbHtml() );
			};
		};
	};



	/*******************************
	 * extended view
	 *******************************/

	this.initExtendedView = function () {

		var $ul = $( "<ul/>" );

		// headers
		var $ths = $( "#table th" );
		var $label = $ths.eq( 1 ).find( "a" );
		var $date = $ths.eq( 2 ).find( "a" );
		var $size = $ths.eq( 3 ).find( "a" );
		var $li = $( "<li class='header' />" ).appendTo( $ul );
		$( "<a class='icon'></a>" ).appendTo( $li );
		$( "<a class='label' href='" + $label.attr( "href" ) + "'><span class='l10n-name'>" + $label.text() + "</span></a>" ).appendTo( $li );
		$( "<a class='date' href='" + $date.attr( "href" ) + "'><span class='l10n-lastModified'>" + $date.text() + "</span></a>" ).appendTo( $li );
		$( "<a class='size' href='" + $size.attr( "href" ) + "'><span class='l10n-size'>" + $size.text() + "</span></a>" ).appendTo( $li );

		// header sort icons
		var sortquery = document.location.search;
		var order = {
			column: ( sortquery.indexOf( "C=N" ) >= 0 ) ? "name" : ( sortquery.indexOf( "C=M" ) >= 0 ) ? "date" : ( sortquery.indexOf( "C=S" ) >= 0 ) ? "size" : h5ai.config.sortorder.column,
			ascending: ( sortquery.indexOf( "O=A" ) >= 0 ) ? true : ( sortquery.indexOf( "O=D" ) >= 0 ) ? false : h5ai.config.sortorder.ascending
		};
		var $icon;
		if ( order.ascending ) {
			$icon = $( "<img src='/h5ai/images/ascending.png' class='sort' alt='ascending' />" );
		} else {
			$icon = $( "<img src='/h5ai/images/descending.png' class='sort' alt='descending' />" );
		};
		if ( order.column === "date" ) {
			$li.find( "a.date" ).prepend( $icon );
		} else if ( order.column === "size" ) {
			$li.find( "a.size" ).prepend( $icon );
		} else {
			$li.find( "a.label" ).append( $icon );
		};

		// entries
		$( "#table td" ).closest( "tr" ).each( function () {
			var path = pathCache.getPathForTableRow( document.location.pathname, this );
			$ul.append( path.updateExtendedHtml() );
		} );

		$( "#extended" ).append( $ul );
		$.log( document.location.pathname, "folders:", $( "#extended .folder" ).size() , "files:", $( "#extended .file" ).size() );

		// empty
		if ( $ul.children( ".entry:not(.parentfolder)" ).size() === 0 ) {
			$( "#extended" ).append( $( "<div class='empty l10n-empty'>empty</div>" ) );
		};

		// in case of floats
		$( "#extended" ).addClass( "clearfix" );
	};



	/*******************************
	 * customize
	 *******************************/

	this.customize = function () {

		$.ajax( {
			url: this.config.customHeader,
			dataType: "html",
			success: function ( data ) {
				$( "#content > header" ).append( $( data ) ).show();
			}
		} );

		$.ajax( {
			url: this.config.customFooter,
			dataType: "html",
			success: function ( data ) {
				$( "#content > footer" ).prepend( $( data ) ).show();
			}
		} );
	};



	/*******************************
	 * init counts
	 *******************************/

	this.initCounts = function () {

		$( ".folderCount" ).text( $( "#extended .entry.folder:not(.parentfolder)" ).size() );
		$( ".fileCount" ).text( $( "#extended .entry.file" ).size() );
	};
};
