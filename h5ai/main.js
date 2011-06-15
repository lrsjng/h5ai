( function( $ ) {

	var columnClasses = [ "icon", "name", "date", "size" ];
	var defaultSortOrder = "C=N;O=A"
	var h5aiPath = "/h5ai"
	var views = [ "details", "icons" ];


	$( function() {

		init();
	} );


	function init () {

		checkView();
		convertToHtml5();
		addBreadcrumb();
		addColumnClasses();
		initTableRows();
		addSortOrderIcons();
		addTopAndBottom();
		initViews();
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
				$ul.append( $( "<li class=\"crumb\"><a href='" +  path + "'><img src='" + h5aiPath + "/icons/crumb.png' alt='>' />" + part + "</a></li>" ) );
			}
		}

		$( "nav li a" ).closest( "li" )
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
			.addClass( "header" )
			.click( function () {
				document.location.href = $( this ).find( "a" ).attr( "href" );
			} );
		$( "td.name a" ).closest( "tr" )
			.addClass( "entry" )
			.click( function () {
				document.location.href = $( this ).find( "td.name a" ).attr( "href" );
			} );
		$dataRows = $( "td" ).closest( "tr" );
		if ( $dataRows.size() === 0 || $dataRows.size() === 1 && $dataRows.find( "td.name a" ).text() === "Parent Directory" ) {
			$( "#details" ).append( $( "<div id=\"empty\">empty</div>" ) );
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


	function addTopAndBottom() {

		$( "#h5ai-top" ).load( "h5ai.top.html", function( response, status, xhr ) {
			if (status != "error") {
				$( "#h5ai-top" ).show();
			}
		} );
		$( "#h5ai-bottom" ).load( "h5ai.bottom.html", function( response, status, xhr ) {
			if (status != "error") {
				$( "#h5ai-bottom" ).show();
			}
		} );
	};


	function checkView() {
		
		if ( getView() === "icons" ) {
			$( "#details" ).hide();
			$( "#icons" ).show();
		} else {
			$( "#details" ).show();
			$( "#icons" ).hide();
		}
	};


	function getView() {
	
		var view = localStorage.getItem( "h5ai.view" );
		if ( $.inArray( view, views ) ) {
			return view;
		};
		return views[0];
	};


	function setView( view ) {
	
		localStorage.setItem( "h5ai.view", view );
		checkView();
	};

	
	function initViews() {

		var $div = $( "<div></div>" );
		$( "td.name a" ).closest( "tr" ).each( function () {
			var $tr = $( this );
			var icon = $tr.find( "td.icon img" ).attr( "src" ).replace( "icon", "image" );
			var name = $tr.find( "td.name a" ).text();
			$( "<div class=\"entry\"></div>" )
				.append( $( "<img src=\"" + icon + "\" />" ) )
				.append( $( "<div class=\"label\">" + name + "</div>" ) )
				.click( function () {
					document.location.href = $tr.find( "td.name a" ).attr( "href" );
				} ).
				appendTo( $div );
		} );
		$div.append( $( "<div class=\"clearfix\"></div>" ) );
		$( "#icons" ).append( $div );


		$( "#viewdetails" ).closest( "li" )
			.click( function () {
				setView( "details" );
			} );
		$( "#viewicons" ).closest( "li" )
			.click( function () {
				setView( "icons" );
			} );
	};

} )( jQuery );
