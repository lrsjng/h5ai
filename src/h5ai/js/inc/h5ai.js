( function( $ ) {



	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {

		$.h5ai = new H5ai();
	} );



	H5ai = function ( options ) {

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
				crumb: "/h5ai/images/crumb.png",
				ascending: "/h5ai/images/ascending.png",
				descending: "/h5ai/images/descending.png"
			},
			customHeader: "h5ai.header.html",
			customFooter: "h5ai.footer.html",
			callbacks: {
				folderClick: [],
				fileClick: []			
			}
		};



		/*******************************
		 * public api
		 *******************************/
		
		this.folderClick = function ( fn ) {

			if ( typeof fn === "function" ) {
				config.callbacks.folderClick.push( fn );
			};
			return this;
		};


		this.fileClick = function ( fn ) {

			if ( typeof fn === "function" ) {
				config.callbacks.fileClick.push( fn );
			};
			return this;
		};



		/*******************************
		 * init (will be called at the bottom)
		 *******************************/

		var init = function () {

			applyViewmode();
			initBreadcrumb();
			initViews();
			customize();
		};



		/*******************************
		 * callback triggers
		 *******************************/

		var triggerFolderClick = function ( label ) {

			for ( idx in config.callbacks.folderClick ) {
				config.callbacks.folderClick[idx].call( window, label );
			};
		};


		var triggerFileClick = function ( label ) {

			for ( idx in config.callbacks.fileClick ) {
				config.callbacks.fileClick[idx].call( window, label );
			};
		};



		/*******************************
		 * local stored viewmode
		 *******************************/

		var getViewmode = function () {
		
			var viewmode = localStorage.getItem( config.store.viewmode );
			if ( $.inArray( viewmode, config.viewmodes ) ) {
				return viewmode;
			};
			return config.viewmodes[0];
		};


		var applyViewmode = function ( viewmode ) {

			$( "#table" ).hide();
			if ( viewmode !== undefined ) {
				localStorage.setItem( config.store.viewmode, viewmode );
			};
			$( "body > nav li.view" ).removeClass( "current" );
			if ( getViewmode() === "icons" ) {
				$( "#viewicons" ).closest( "li" ).addClass( "current" );
				$( "#extended" ).removeClass( "details-view" ).addClass( "icons-view" ).show();
			} else {
				$( "#viewdetails" ).closest( "li" ).addClass( "current" );
				$( "#extended" ).addClass( "details-view" ).removeClass( "icons-view" ).show();
			};
		};

		
		
		/*******************************
		 * breadcrumb and doc title
		 *******************************/

		var initBreadcrumb = function () {

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
				};
			};
			$( "body > nav .crumb:last" ).addClass( "current" );

			document.title = document.domain + pathname;
		};



		/*******************************
		 * table view
		 *******************************/

		var initTableView = function () {

			function getColumnClass( idx ) {

				if ( idx >= 0 && idx < config.columnClasses.length ) {
					return config.columnClasses[idx];
				};
				return "unknown";
			};
			
			$( "#table td" ).removeAttr( "align" ).removeAttr( "valign" );
			$( "#table tr" ).each( function () {
				var colIdx = 0;
				$( this ).find( "th,td" ).each( function () {
					$( this ).addClass( getColumnClass( colIdx++ ) );
				} );
			} );
		};



		/*******************************
		 * extended view
		 *******************************/

		var initExtendedView = function () {

			var $ul = $( "<ul/>" );

			// headers
			var $li = $( "<li class='header' />" ).appendTo( $ul );
			$( "<a class='icon'></a>" ).appendTo( $li );
			var $label = $( "th.name a" );
			var $date = $( "th.date a" );
			var $size = $( "th.size a" );
			$( "<a class='label' href='" + $label.attr( "href" ) + "'>" + $label.text() + "</a>" ).appendTo( $li );
			$( "<a class='date' href='" + $date.attr( "href" ) + "'>" + $date.text() + "</a>" ).appendTo( $li );
			$( "<a class='size' href='" + $size.attr( "href" ) + "'>" + $size.text() + "</a>" ).appendTo( $li );

			// header sort icons
			var order = document.location.search;
			if ( order === "" ) {
				order = config.defaultSortOrder;
			};
			var $icon;
			if ( order.indexOf( "O=A" ) >= 0 ) {
				$icon = $( "<img src='" + config.icons.ascending + "' class='sort' alt='ascending' />" );
			} else {
				$icon = $( "<img src='" + config.icons.descending + "' class='sort' alt='descending' />" );
			};
			if ( order.indexOf( "C=N" ) >= 0 ) {
				$li.find( "a.label" ).append( $icon );
			} else if ( order.indexOf( "C=M" ) >= 0 ) {
				$li.find( "a.date" ).prepend( $icon );
			} else if ( order.indexOf( "C=S" ) >= 0 ) {
				$li.find( "a.size" ).prepend( $icon );
			};
			
			// entries
			$( "#table td.name a" ).closest( "tr" ).each( function () {
				var $tr = $( this );
				var $img = $tr.find( "td.icon img" );
				var iconsmall = $img.attr( "src" );
				var iconbig = iconsmall.replace( "16x16", "48x48" );
				var alt = $img.attr( "alt" );
				var $link = $tr.find( "td.name a" );
				var label = $link.text();
				var href = $link.attr( "href" );
				var date = $tr.find( "td.date" ).text();
				var size = $tr.find( "td.size" ).text();

				var $li = $( "<li class='entry' />" ).appendTo( $ul );
				if ( alt === "[DIR]" ) {
					$li.addClass( "folder" );
				} else {
					$li.addClass( "file" );					
				}
				var $a = $( "<a href='" + href + "' />" ).appendTo( $li );
				$( "<span class='icon small'><img src='" + iconsmall + "' alt='" + alt + "' /></span>" ).appendTo( $a );
				$( "<span class='icon big'><img src='" + iconbig + "' alt='" + alt + "' /></span>" ).appendTo( $a );
				$( "<span class='label'>" + label + "</span>" ).appendTo( $a );
				$( "<span class='date'>" + date + "</span>" ).appendTo( $a );
				$( "<span class='size'>" + size + "</span>" ).appendTo( $a );
			} );

			$( "#extended" ).append( $ul );

			// empty
			$entries = $( "#extended .entry" );
			if ( $entries.size() === 0 || $entries.size() === 1 && $entries.find( ".label" ).text() === "Parent Directory" ) {
				$( "#extended" ).append( $( "<div class='empty'>empty</div>" ) );
			};

			// in case of floats
			$( "#extended" ).append( $( "<div class='clearfix' />" ) );

			// click callbacks
			$( "#extended .entry.folder" )
				.click( function() {
					triggerFolderClick( $( this ).find( ".label" ).text() );
				} );
			$( "#extended .entry.file" )
				.click( function() {
					triggerFileClick( $( this ).find( ".label" ).text() );
				} );
		};


		/*******************************
		 * init views
		 *******************************/

		var initViews = function () {

			initTableView();
			initExtendedView();

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

		var customize = function () {

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



		/*******************************
		 * finally run init
		 *******************************/

		init();
	};

} )( jQuery );
