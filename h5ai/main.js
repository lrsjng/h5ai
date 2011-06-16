( function( $ ) {


	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {

		checkViewmode();
		addBreadcrumb();
		addTopAndBottom();
		initViews();
	} );




	/*******************************
	 * config
	 *******************************/

	var columnClasses = [ "icon", "name", "date", "size" ];
	var defaultSortOrder = "C=N;O=A"
	var h5aiPath = "/h5ai"
	var viewmodes = [ "details", "icons" ];




	/*******************************
	 * local stored viewmode
	 *******************************/

	function getViewmode() {
	
		var viewmode = localStorage.getItem( "h5ai.viewmode" );
		if ( $.inArray( viewmode, viewmodes ) ) {
			return viewmode;
		};
		return viewmodes[0];
	};


	function setViewmode( viewmode ) {
	
		localStorage.setItem( "h5ai.viewmode", viewmode );
		checkViewmode();
	};

	
	function checkViewmode() {
		
		if ( getViewmode() === "icons" ) {
			$( "#details" ).hide();
			$( "#icons" ).show();
		} else {
			$( "#details" ).show();
			$( "#icons" ).hide();
		}
	};




	/*******************************
	 * breadcrumb
	 *******************************/

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
			.click( function () {
				document.location.href = $( this ).find( "a" ).attr( "href" );
			} );

		document.title = document.domain + pathname;
	};




	/*******************************
	 * details view
	 *******************************/

	function convertToHtml5() {

		$( "#details td" ).removeAttr( "align" ).removeAttr( "valign" );
	};


	function getColumnClass( idx ) {

		if ( idx >= 0 && idx < columnClasses.length ) {
			return columnClasses[idx];
		}
		return "unknown";
	};


	function addColumnClasses() {

		$( "#details tr" ).each( function () {
			var colIdx = 0;
			$( this ).find( "th,td" ).each( function () {
				$( this ).addClass( getColumnClass( colIdx ) );
				colIdx++;
			} );
		} );
	};


	function initTableRows() {

		$( "#details th a" ).closest( "th" )
			.addClass( "header" )
			.click( function () {
				document.location.href = $( this ).find( "a" ).attr( "href" );
			} );
		$( "#details td.name a" ).closest( "tr" )
			.addClass( "entry" )
			.click( function () {
				document.location.href = $( this ).find( "td.name a" ).attr( "href" );
			} );
		$dataRows = $( "#details td" ).closest( "tr" );
		if ( $dataRows.size() === 0 || $dataRows.size() === 1 && $dataRows.find( "td.name a" ).text() === "Parent Directory" ) {
			$( "#details" ).append( $( "<div class='empty'>empty</div>" ) );
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
			$( "#details th.name a" ).append( $icon );
		} else if ( order.indexOf( "C=M" ) >= 0 ) {
			$( "#details th.date a" ).prepend( $icon );
		} else if ( order.indexOf( "C=S" ) >= 0 ) {
			$( "#details th.size a" ).prepend( $icon );
		}
	};


	function initDetailsView() {

		convertToHtml5();
		addColumnClasses();
		initTableRows();
		addSortOrderIcons();
	};




	/*******************************
	 * icons view
	 *******************************/

	function initIconsView() {

		var $div = $( "<div></div>" );
		$( "#details td.name a" ).closest( "tr" ).each( function () {
			var $tr = $( this );
			var icon = $tr.find( "td.icon img" ).attr( "src" ).replace( "icon", "image" );
			var name = $tr.find( "td.name a" ).text();
			$( "<div class=\"entry\"></div>" )
				.append( $( "<img src='" + icon + "' />" ) )
				.append( $( "<div class='label'>" + name + "</div>" ) )
				.click( function () {
					document.location.href = $tr.find( "td.name a" ).attr( "href" );
				} ).
				appendTo( $div );
		} );
		$div.append( $( "<div class='clearfix'></div>" ) );
		$( "#icons" ).append( $div );
	};




	/*******************************
	 * init views
	 *******************************/

	function initViews() {

		initDetailsView();
		initIconsView();

		$( "#viewdetails" ).closest( "li" )
			.click( function () {
				setViewmode( "details" );
			} );
		$( "#viewicons" ).closest( "li" )
			.click( function () {
				setViewmode( "icons" );
			} );
	};




	/*******************************
	 * top and bottom messages
	 *******************************/

	function addTopAndBottom() {

		$( "#top" ).load( "h5ai.top.html", function( response, status, xhr ) {
			if (status != "error") {
				$( "#top" ).show();
			}
		} );
		$( "#bottom" ).load( "h5ai.bottom.html", function( response, status, xhr ) {
			if (status != "error") {
				$( "#bottom" ).show();
			}
		} );
	};

} )( jQuery );
