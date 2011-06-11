( function( $ ) {

	var columnClasses = [ "icon", "name", "date", "size" ];
	var defaultSortOrder = "C=N;O=A"
	var h5aiPath = "/h5ai"


	$( function() {

		init();
	} );


	function init () {

		convertToHtml5();
		addBreadcrumb();
		addColumnClasses();
		initTableRows();
		addSortOrderIcons();
		//specialFiles();
	};

	
	function convertToHtml5() {

		$( "td" ).removeAttr( "align" ).removeAttr( "valign" );
	};


	function addBreadcrumb() {

		$( "#domain span" ).text( document.domain );
		var pathname = decodeURI( document.location.pathname );
		var parts = pathname.split( "/" );
		var path = "/";
		var $ul = $( "nav ul" );
		for ( idx in parts ) {
			var part = parts[idx];
			if ( part !== "" ) {
				path += part + "/";
				$ul.append( $( "<li class='crumb'><a href='" +  path + "'><img src='" + h5aiPath + "/icons/crumb.png' alt='>' />" + part + "</a></li>" ) );
			}
		}

		$( "nav li a" ).closest( "li" )
			.hover(
				function () {
					$( this ).addClass( "hover" );
				},
				function () {
					$( this ).removeClass( "hover" );
				}
			)
			.click( function () {
				document.location.href = $( this ).find( "a" ).attr( "href" );
			} );

		document.title = document.domain + pathname;
	};


	function getColumnClass( idx ) {

		if ( idx >= 0 && idx < columnClasses.length ) {
			return columnClasses[idx];
		}
		return "unknown";
	};


	function addColumnClasses() {

		$( "tr" ).each( function () {
			var colIdx = 0;
			$( this ).find( "th,td" ).each( function () {
				$( this ).addClass( getColumnClass( colIdx ) );
				colIdx++;
			} );
		} );
	};


	function initTableRows() {

		$( "th a" ).closest( "th" )
			.hover(
				function () {
					$( this ).addClass( "hover" );
				},
				function () {
					$( this ).removeClass( "hover" );
				}
			)
			.click( function () {
				document.location.href = $( this ).find( "a" ).attr( "href" );
			} );
		$( "td.name a" ).closest( "tr" )
			.hover(
				function () {
					$( this ).addClass( "hover" );
				},
				function () {
					$( this ).removeClass( "hover" );
				}
			)
			.click( function () {
				document.location.href = $( this ).find( "td.name a" ).attr( "href" );
			} );
		$dataRows = $( "td" ).closest( "tr" );
		if ( $dataRows.size() === 0 || $dataRows.size() === 1 && $dataRows.find( "td.name a" ).text() === "Parent Directory" ) {
			$( "#empty" ).show();
		}
	};


	function addSortOrderIcons() {

		var order = document.location.search;
		if ( order === "" ) {
			order = defaultSortOrder;
		}
		var $icon;
		if ( order.indexOf( "O=A" ) >= 0 ) {
			$icon = $( "<img src='" + h5aiPath + "/icons/ascending.png' class='sort' alt='ascending' />" );
		} else {
			$icon = $( "<img src='" + h5aiPath + "/icons/descending.png' class='sort' alt='descending' />" );
		}
		if ( order.indexOf( "C=N" ) >= 0 ) {
			$( "th.name a" ).append( $icon );
		} else if ( order.indexOf( "C=M" ) >= 0 ) {
			$( "th.date a" ).prepend( $icon );
		} else if ( order.indexOf( "C=S" ) >= 0 ) {
			$( "th.size a" ).prepend( $icon );
		}
	};


	function specialFiles() {

		specialFile( "README", "readme.png" );
		specialFile( "ChangeLog", "changelog.png" );
		specialFile( "INSTALL", "install.png" );
		specialFile( "COPYING", "copying.png" );
		specialFile( "LICENSE", "copying.png" );
		specialFile( "AUTHORS", "authors.png" );
	};


	function specialFile( name, img ) {

		if ( $( "td.name a:contains(" + name + ")" ).size() > 0 ) {
			$( "#special" )
				.append( $( "<img src='" + h5aiPath + "/images/" + img + "' alt='readme' />" ) )
				.show();
		}
	};

} )( jQuery );
