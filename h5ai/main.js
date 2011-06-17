( function( $ ) {


	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {

		applyViewmode();
		initBreadcrumb();
		initViews();
		customize();
	} );




	/*******************************
	 * config
	 *******************************/

	var config = {
		columnClasses: [ "icon", "name", "date", "size" ],
		defaultSortOrder: "C=N;O=A",
		viewmodes: [ "details", "icons" ],
		store: {
			viewmode: "h5ai.viewmode"
		},
		icons: {
			crumb: "/h5ai/icons/crumb.png",
			ascending: "/h5ai/icons/ascending.png",
			descending: "/h5ai/icons/descending.png"
		},
		customHeader: "h5ai.header.html",
		customFooter: "h5ai.footer.html",
	};




	/*******************************
	 * local stored viewmode
	 *******************************/

	function getViewmode() {
	
		var viewmode = localStorage.getItem( config.store.viewmode );
		if ( $.inArray( viewmode, config.viewmodes ) ) {
			return viewmode;
		};
		return config.viewmodes[0];
	};


	function applyViewmode( viewmode ) {

		if ( viewmode !== undefined ) {
			localStorage.setItem( config.store.viewmode, viewmode );
		}	
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

	function initBreadcrumb() {

		$( "#domain span" ).text( document.domain );
		var pathname = decodeURI( document.location.pathname );
		var parts = pathname.split( "/" );
		var path = "/";
		var $ul = $( "nav ul" );
		for ( idx in parts ) {
			var part = parts[idx];
			if ( part !== "" ) {
				path += part + "/";
				$ul.append( $( "<li class='crumb'><a href='" +  path + "'><img src='" + config.icons.crumb + "' alt='>' />" + part + "</a></li>" ) );
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

	function makeTableHtml5Conform() {

		$( "#details td" ).removeAttr( "align" ).removeAttr( "valign" );
	};


	function getColumnClass( idx ) {

		if ( idx >= 0 && idx < config.columnClasses.length ) {
			return config.columnClasses[idx];
		}
		return "unknown";
	};


	function initTableColumns() {

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


	function addSortOrderIcon() {

		var order = document.location.search;
		if ( order === "" ) {
			order = config.defaultSortOrder;
		}
		var $icon;
		if ( order.indexOf( "O=A" ) >= 0 ) {
			$icon = $( "<img src='" + config.icons.ascending + "' class='sort' alt='ascending' />" );
		} else {
			$icon = $( "<img src='" + config.icons.descending + "' class='sort' alt='descending' />" );
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

		makeTableHtml5Conform();
		initTableColumns();
		initTableRows();
		addSortOrderIcon();
	};




	/*******************************
	 * icons view
	 *******************************/

	function initIconsView() {

		var $div = $( "<div></div>" );
		$( "#details td.name a" ).closest( "tr" ).each( function () {
			var $tr = $( this );
			var icon = $tr.find( "td.icon img" ).attr( "src" ).replace( "icons", "images" );
			var $link = $tr.find( "td.name a" );
			$( "<div class='entry'><img src='" + icon + "' /><div class='label'>" + $link.text() + "</div></div>" )
				.click( function () {
					document.location.href = $link.attr( "href" );
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
				applyViewmode( "details" );
			} );
		$( "#viewicons" ).closest( "li" )
			.click( function () {
				applyViewmode( "icons" );
			} );
	};




	/*******************************
	 * customize
	 *******************************/


	function customize() {
		$.ajax( {
			url: config.customHeader,
			dataType: "html",
			success: function ( data ) {
				$( "#content > header" ).append( $( data ) ).show();
			}
		} );
		$.ajax( {
			url: config.customFooter,
			dataType: "html",
			success: function ( data ) {
				$( "#content > footer" ).prepend( $( data ) ).show();
			}
		} );
	};


} )( jQuery );
