( function( $ ) {



	/*******************************
	 * init after dom load
	 *******************************/

	$( function() {

		$.h5ai = new H5ai();
	} );



	/*******************************
	 * h5ai
	 *******************************/

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
				crumb: "/h5ai/icons/crumb.png",
				ascending: "/h5ai/icons/ascending.png",
				descending: "/h5ai/icons/descending.png"
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

		var makeTableHtml5Conform = function () {

			$( "#details td" ).removeAttr( "align" ).removeAttr( "valign" );
		};


		var getColumnClass = function ( idx ) {

			if ( idx >= 0 && idx < config.columnClasses.length ) {
				return config.columnClasses[idx];
			}
			return "unknown";
		};


		var initTableColumns = function () {

			$( "#details tr" ).each( function () {
				var colIdx = 0;
				$( this ).find( "th,td" ).each( function () {
					$( this ).addClass( getColumnClass( colIdx ) );
					colIdx++;
				} );
			} );
		};


		var initTableRows = function () {

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
			$( "#details tr.entry" ).each( function () {
				var $row = $( this );
				$row.find( "td.name a" ).addClass( "label" );
				if ( $row.find( "td.icon img" ).attr( "alt" ) === "[DIR]" ) {
					$row.addClass( "folder" );
				} else {
					$row.addClass( "file" );				
				};
			} );
			$entries = $( "#details tr.entry" );
			if ( $entries.size() === 0 || $entries.size() === 1 && $entries.find( "td.name a" ).text() === "Parent Directory" ) {
				$( "#details" ).append( $( "<div class='empty'>empty</div>" ) );
			}
		};


		var addSortOrderIcon = function () {

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


		var initDetailsView = function () {

			makeTableHtml5Conform();
			initTableColumns();
			initTableRows();
			addSortOrderIcon();
		};



		/*******************************
		 * icons view
		 *******************************/

		var initIconsView = function () {

			var $div = $( "<div></div>" );
			$( "#details td.name a" ).closest( "tr" ).each( function () {
				var $tr = $( this );
				var icon = $tr.find( "td.icon img" ).attr( "src" ).replace( "icons", "images" );
				var $link = $tr.find( "td.name a" );
				var $entry = $( "<div class='entry'><img src='" + icon + "' /><div class='label'>" + $link.text() + "</div></div>" )
					.click( function () {
						document.location.href = $link.attr( "href" );
					} ).
					appendTo( $div );
				if ( $tr.hasClass( "folder" ) ) {
					$entry.addClass( "folder" );
				} else {
					$entry.addClass( "file" );
				}
			} );
			$div.append( $( "<div class='clearfix'></div>" ) );
			$( "#icons" ).append( $div );
		};



		/*******************************
		 * init views
		 *******************************/

		var initViews = function () {

			initDetailsView();
			initIconsView();

			$( "#content .entry.folder" )
				.click( function() {
					triggerFolderClick( $( this ).find( ".label" ).text() );
				} );
			$( "#content .entry.file" )
				.click( function() {
					triggerFileClick( $( this ).find( ".label" ).text() );
				} );

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
